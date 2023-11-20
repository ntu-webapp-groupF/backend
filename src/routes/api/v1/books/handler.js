import axios from 'axios';
import { prisma } from '../../../../adapters.js';

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function testUpload(req, res) {
    console.log(req.files)
    console.log(req.body)
    console.log(req.body['test3'] == null)
	return res.status(200).json({'message': 'OK'})
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function createBooks(req, res) {
    // no session, bye bye
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message': 'Login First!'})
    }

    // no permission, bye bye
    if( req.session.user.permission < 2 ){
        return res.status(403).json({'message': 'No permission'})
    }

    // Not match with our specification !
    if( !req.files            || 
        req.files.length <= 0 ||
        !req.body['bookname'] ||
        !req.body['description'] || 
        !req.body['category_names'] || 
        req.body['age'] === undefined || 
        req.body['price'] === undefined
    ){
        return res.status(400).json({'message': 'Bad Request'})
    }

    const book = await prisma.books.create({
        data: {
            bookname: req.body['bookname'],
            description: req.body['description'],
            age: parseInt(req.body['age']),
            price: parseFloat(req.body['price']),
            owner: req.session.user.username,
        }
    });

    const formData = new FormData();

    req.files.forEach((file, i) => {
        const blob = new Blob([file.buffer], { type: file.mimetype });
        formData.append(`file${i}`, blob, {
            filename: file.originalname,
            content_type: file.mimetype,
        });
    });

    const response = await axios({
        method: 'post',
        url: process.env.IMAGE_HOST + `/images/${req.session.user.id}`,
        data: formData,
        headers: {
            'Content-Type': `multipart/form-data`,
        },
    });

    if( response.status != 200 ){
        return res.status(500).json({'message': 'Not OK at image upload'})
    }

    for(let i = 0;i < response.data.length;i++){
        const file_inst = response.data[i];
        try{
            const new_image = await prisma.images.create({
                data: {
                    books_id: book.id,
                    page: i,
                    file_path: file_inst.path,
                }
            });
        } catch(e) {
            return res.status(500).json(e);
        }
    }

    for(let i = 0;i < req.body['category_names'].length; i++){
        const category_name = req.body['category_names'][i];
        try{
            const new_category = await prisma.categorys.create({
                data: {
                    books_id: book.id,
                    categoryname: category_name, 
                }
            });
        } catch(e) {
            return res.status(500).json(e);
        }
    }

    return res.status(200).json(book);
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function editBooksInfo(req, res){
    // no session, bye bye
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message': 'Login First!'})
    }

    if( !req.body['bookname']    ||
        !req.body['description'] ||
        !req.body['category_names'] || 
        req.body['age'] === undefined ||
        req.body['price'] === undefined
    ){
        return res.status(400).json({'message': "Bad request field."})
    }

    try{
        const book_id = parseInt(req.params.id);

        const book = await prisma.books.findUnique({
            where: {
                id: book_id,
            },
            include: {
                category_list: true,
            }
        });
        
        const req_category_set = new Set(req.body['category_names']);
        const book_category_set = new Set();
        for(let i = 0;i < book.category_list.length;i++){
            const category = book.category_list[i];
            book_category_set.add(category.categoryname);
        }

        const to_add_set = new Set(req_category_set);
        for(const element of book_category_set){
            to_add_set.delete(element);
        }

        const to_delete_set = new Set(book_category_set);
        for(const element of req_category_set){
            to_delete_set.delete(element);
        }

        for( const to_delete_category of to_delete_set ){
            const categoryx = await prisma.categorys.deleteMany({
                where: {
                    books_id: book_id,
                    categoryname: to_delete_category,
                }
            });
        }
        for( const to_add_category of to_add_set ){
            const categoryx = await prisma.categorys.create({
                data: {
                    books_id: book_id,
                    categoryname: to_add_category,
                }
            });
        }

        const new_book = await prisma.books.update({
            where: {
                id: book_id,
                owner: req.session.user.username,
            },
            data: {
                bookname: req.body['bookname'],
                description: req.body['description'],
                age: parseInt(req.body['age']),      
                price: parseFloat(req.body['price']),
            },
            include: {
                category_list: true
            }
        });

        return res.status(200).json(new_book);

    } catch (e) {
        return res.status(500).json({'message': e})
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function editBooksContent(req, res){
    //TODO: edit book content by per images. only Author can use this function.
    return res.status(200).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function deleteBooks(req, res) {
    // no session, bye bye
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message' : 'Login First!'});
    }

    try{
        const book_id = parseInt(req.params.book_id)
        try{
            await prisma.books.delete({
                where: {
                    id: book_id,
                    owner: req.session.user.username,
                }
            });
            return res.status(200).json({'message': "OK"});
        } catch (e) {
            return res.status(500).json({'message': 'something wrong in delete...', 'error' : e })
        }
    } catch (e) {
        return res.status(400).json({'message': 'book_id is integer !'})
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksContentById(req, res){
    try{
        const book_id = parseInt(req.params.book_id);
        const image_id = parseInt(req.params.image_id);

        try{
            const book = await prisma.books.findUnique({
                where: {
                    id: book_id,
                },
                include: {
                    images_list: {
                        where: {
                            id: image_id
                        }
                    }
                }
            })

            if( book.images_list.length <= 0 ){
                return res.status(404).json("image not found!");
            }

            const response = await axios({
                method: 'get',
                url: process.env.IMAGE_HOST + `/image`,
                data: {
                    path: book.images_list[0]['file_path']
                },
                responseType: 'stream', // Ensure the response type is a stream
            });

            if( response.status === 200 ){
                
                res.set('Content-Type', response.headers['content-type']);
                response.data.pipe(res);
            } else {
                return res.status(response.status).json(response.data);
            }
        }
        catch (e) {
            return res.status(404).json({'error': e});
        }

    } catch (e) {
        return res.status(400).json({'error': 'Bad Request Field'});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getAllBooks(req, res) {
    try{
        const books = await prisma.books.findMany({
            include: {
                category_list: true,
                images_list: true,
            }
        });
        return res.json(books).status(200);
    } catch (e) {
        return res.status(500).json({'message': e});
    }
}


/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getRecommendBooks(req, res) {
    //TODO: return recommend books
    return res.status(500).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksByCategorys(req, res) {
    //TODO: return books by categorys filter
    return res.status(500).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getCollectionBooks(req, res){
    //TODO: return collection books for current user
    return res.status(500).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksByAgeRange(req, res){
    //TODO: return books that have age lies on the range in request
    return res.status(500).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksByPriceRange(req, res){
    //TODO: return books that have price lies on the range in request
    return res.status(500).json({'message': 'TODO'});
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getPurchasedBooks(req, res){
    //TODO: return books that have purchased by current users
    return res.status(500).json({'message': 'TODO'});
}



