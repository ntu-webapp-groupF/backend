// in src/routes/api/v1/books/index.js
import { Router } from 'express';
import { testUpload, createBooks } from './handler.js';
import multer from 'multer';

const MAX_UPLOAD_IMAGE = process.env.MAX_UPLOAD_IMAGE || 10;

const router = Router();
const upload = multer()

router.post('/', upload.array('images', MAX_UPLOAD_IMAGE), createBooks)

router.post('/test', upload.array('files', 8), testUpload)

export default router;