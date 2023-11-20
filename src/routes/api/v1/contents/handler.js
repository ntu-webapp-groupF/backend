import axios from 'axios';
import { prisma } from '../../../../adapters.js';

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function getBooksContentById(req, res){
    let book_id = 0;
    let image_id = 0;
    try{
        book_id = parseInt(req.params.book_id);
        image_id = parseInt(req.params.image_id);
    } catch (e) {
        return res.status(400).json({error: 'Bad Request'});
    }

    const book = await prisma.books.findUnique({
        where: {
            id: book_id,
        },
        include: {
            images_list: {
                where: {
                    id: image_id
                }
            },
            ownership_list: true
        }
    })

    if( book.images_list.length <= 0 ){
        return res.status(404).json("image not found!");
    }

    if( book.images_list[0]['page'] >= 4 ){
        if( !req.session || !req.session.user ){
            return res.status(403).json("Guest Only allow to read first 4 pages");
        }
        else if( book.ownership_list[0].users_id !== req.session.user.id ){
            const purchasedShipment = await prisma.boughtBooks.findMany({
                where: {
                    users_id: req.session.user.id,
                    books_id: book.id
                }
            });
            if( purchasedShipment.length === 0 && book.images_list[0]['page'] >= 4){
                return res.status(403).json("Buy it to unlock all pages");
            }
        }
    }

    // Proceed to get image
    try{
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
    } catch (e) {
        return res.status(500).json({error: e});
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
*/
export async function editBooksContentById(req, res){
    // no session, bye bye
    if( !req.session || !req.session.user ){
        return res.status(401).json({'message': 'Login First!'})
    }

    if( !req.files || req.files.length !== 1 ){
        return res.status(400).json({'message' : 'Bad Request' })
    }

    const book_id = parseInt(req.params.book_id);
    const image_id = parseInt(req.params.image_id);

    const image = await prisma.images.findUnique({
        where: {
            id: image_id,
            books_id: book_id,
        },
        include: {
            book: {
                include: {
                    ownership_list: true
                }
            }
        }
    });

    if (!image ) return res.status(404).json("content not found!");
    if( image.book.ownership_list[0].users_id !== req.session.user.id ){
        return res.status(403).json('NOT YOU!');
    }

    const formData = new FormData();
    const file = req.files[0];
    const blob = new Blob([file.buffer], { type: file.mimetype });
    
    formData.append('file', blob, {
        filename: file.originalname,
        content_type: file.mimetype,
    });
    formData.append('path', image.file_path);

    const response = await axios({
        method: 'post',
        url: process.env.IMAGE_HOST + `/edit/image/${req.session.user.id}`,
        data: formData,
        headers: {
            'Content-Type': `multipart/form-data`,
        }
    });

    if( response.status != 200 ){
        return res.status(response.status).json({'message': response.data})
    } 

    const new_file_inst = response.data;
    const new_image = await prisma.images.update({
        where: {
            id: image_id
        },
        data:{
            file_path: new_file_inst.path,
        }
    });

    return res.status(200).json(new_image);
}
