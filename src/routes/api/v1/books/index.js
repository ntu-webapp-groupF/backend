// in src/routes/api/v1/books/index.js
import { Router } from 'express';
import { testUpload, createBooks, deleteBooks, getAllBooks, editBooksInfo, getBooksContentById } from './handler.js';
import multer from 'multer';

const MAX_UPLOAD_IMAGE = process.env.MAX_UPLOAD_IMAGE || 10;

const router = Router();
const upload = multer()

router.post('/', upload.array('images', MAX_UPLOAD_IMAGE), createBooks)
router.delete('/:book_id', deleteBooks)
router.get('/', getAllBooks)
router.put('/edit/:id', editBooksInfo)
router.get('/:book_id/pages/:image_id', getBooksContentById)
//router.post('/test', upload.array('files', 8), testUpload)

export default router;