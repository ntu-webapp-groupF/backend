import axios from 'axios';
import { prisma } from '../../../../adapters.js';

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBookById(req, res) {
    try{
        const book_id = parseInt(req.params.id);
        const book = await prisma.books.findUnique({
            where: {
                id: book_id
            },
            include: {
                category_list: true,
                images_list: true,
            }
        });
        return res.status(200).json(book);
    } catch (e) {
        return res.status(500).json({'message': e});
    }
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

    for(let i =0 ;i < response.data.length; i++){
        const file_inst = response.data[i];
        try{
            await prisma.images.create({
                data: {
                    books_id: book.id,
                    page: i,
                    file_path: file_inst.path,
                }
            });
        } catch(e) {
            console.log(e);
            return res.status(500).json(e);
        }
    }

    if( req.body['category_names'] instanceof Array === true ){
        req.body['category_names'].map( async (category_name) => {
            try{
                await prisma.categorys.create({
                    data: {
                        books_id: book.id,
                        categoryname: category_name, 
                    }
                });
            } catch(e) {
                return res.status(500).json(e);
            }
        })
    } else {
        const category_name = req.body['category_names'];
        try{
            await prisma.categorys.create({
                data: {
                    books_id: book.id,
                    categoryname: category_name, 
                }
            });
        } catch(e) {
            return res.status(500).json(e);
        }
    }

    await prisma.ownerships.create({
        data: {
            users_id: req.session.user.id,
            books_id: book.id
        }
    });

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
                owner: req.session.user.username,
            },
            include: {
                category_list: true,
            }
        });

        if( !book ) return res.status(404).json({'message': 'Not such book exists'});
        
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
export async function purchaseBooks(req, res) {
    // no session, bye bye
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message' : 'Login First!'});
    }

    const book_id = parseInt(req.params.book_id);
    const book = await prisma.books.findUnique({
        where: {
            id: book_id
        }
    });
    if( !book ) return res.status(404).json({'message': 'Not such Book!'});

    /* OAuth here or bank transaction here */
    const isTransmit = true;

    if( isTransmit ){
        try{
            const boughtBook = await prisma.boughtBooks.create({
                data: {
                    users_id: req.session.user.id,
                    books_id: book.id
                },
                include: {
                    book: true,
                }
            });
            return res.status(200).json(boughtBook)
        } catch (e) {
            return res.status(500).json({error: 'Internal Server Error'});
        }
        
    } else {
        return res.status(400).json({'message': 'Transcation failed :<'});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function addBooksCollection(req, res) {
    // no session, bye bye
    if( !req.session || !req.session.user || req.session.user.permission <= 0 ){
        return res.status(401).json({'message' : 'Login First!'});
    }

    const book_id = parseInt(req.params.book_id);
    const book = await prisma.books.findUnique({
        where: {
            id: book_id
        }
    });
    if( !book ) return res.status(404).json({'message': 'Not such Book!'});


    try{
        const collectionBook = await prisma.collections.create({
            data: {
                users_id: req.session.user.id,
                books_id: book.id
            },
            include: {
                book: true,
            }
        });
        return res.status(200).json(collectionBook)
    } catch(e) {
        return res.status(500).json({error: 'Internal Server Error'});
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
    // no session, bye bye
    if( !req.session || !req.session.user || req.session.user.permission <= 0 ){
        return res.status(401).json({'message' : 'Login First!'});
    }
    //filter by userid from historys
    const findCategorys = await prisma.historys.findMany({
      where: {
        users_id: req.session.user.id,
      },
      orderBy: {
        times: 'desc',
      },
      include:{
        category:true
      }
    })
    // set category_id to 0 if user_id not found in historys
    var category_name = "animal";
    //console.log(findCategorys);
    if(findCategorys.length != 0){
        category_name = findCategorys[0].category.categoryname;
    }
    //console.log("Category_id:",category_id);

    //get books by category_id
    try{
        const books = await prisma.categorys.findMany({
            where: {
                categoryname: category_name
            },

            include: {
                book:{
                    include:{
                        category_list:true,
                        images_list:true,
                    }
                },
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
export async function getBooksByCategorys(req, res) {
    const category_id = parseInt(req.params.category_id);
    var category;
    try{
         category = await prisma.categorys.findUnique({
            where: {
                id: category_id
            },

        });
    } catch (e) {
        return res.status(500).json({'message1': e});
    }

    try{
        const books = await prisma.categorys.findMany({
            where: {
                categoryname: category.categoryname
            },

            include: {
                book: true
            }

        });

        return res.json(books).status(200);
    } catch (e) {
        return res.status(500).json({'message2': e});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getCollectionBooks(req, res){
    console.log("getCollectionBooks");

    if( !req.session || !req.session.user || req.session.user.permission <= 0 ){
        return res.status(401).json({'message' : 'Login First!'});
    }
    //get all collections by user_id
    try{
        console.log("gettingCollectionBooks");
        const allCollections = await prisma.collections.findMany({
          where: {
            users_id: req.session.user.id,
          },
          include:{
            book:{
                include:{
                    category_list:true,
                    images_list:true,
                }
            },
            
          },
        });
        return res.json(allCollections).status(200);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json({'message1': e});
    }
  
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksByAgeRange(req, res){
    //console.log(parseInt(req.params.age1),parseInt(req.params.age2));
    try{
        const books = await prisma.books.findMany({
            where: {
                age:{
                    gte:parseInt(req.params.age1),
                    lte:parseInt(req.params.age2),
                },
            }
        });
        return res.json(books).status(200);
    } catch (e) {
        console.log(e);
        return res.status(500).json({'message1': e});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksByPriceRange(req, res){
    try{
        const books = await prisma.books.findMany({
            where: {
                price:{
                    gte:parseInt(req.params.price1),
                    lte:parseInt(req.params.price2),
                },
            }
        });
        return res.json(books).status(200);
    } catch (e) {
        console.log(e);
        return res.status(500).json({'message1': e});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getPurchasedBooks(req, res){
    console.log("getPurchasedBooks");
    if( !req.session || !req.session.user || req.session.user.permission <= 0 ){
        return res.status(401).json({'message' : 'Login First!'});
    }


    //get all boughtBooks by user_id
    try{
        console.log("gettingPurchasedBooks");
        const allBoughtBooks = await prisma.boughtBooks.findMany({
          where: {
            users_id: req.session.user.id,
          },
          include:{
            book:{
                include:{
                    category_list:true,
                    images_list:true,
                }
            },
          }
        })
        return res.json(allBoughtBooks).status(200);
    }catch (e) {
        console.log(e);
        return res.status(500).json({'message1': e});
    }
 
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getUploadedBooks(req, res){
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message' : 'Login First!'});
    }

    // get all uploaded books (ownership)
    try{
        const allUploadedBooks = await prisma.ownerships.findMany({
          where: {
            users_id: req.session.user.id,
          },
          include:{
            book: {
                include: {
                    category_list: true,
                    images_list: true,
                }
            }
          }
        })
        return res.json(allUploadedBooks).status(200);
    }catch(e){
        console.log(e);
        return res.status(500).json({'message1': e});
    }
}