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
    
    req.session.user = {
        id: 2,
        permission: 2,
        username: 'baubau'
    }

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