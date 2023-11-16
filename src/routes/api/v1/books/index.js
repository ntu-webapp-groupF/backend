// in src/routes/api/v1/books/index.js
import { Router } from 'express';
import { testUpload } from './handler.js';
import multer from 'multer';

const router = Router();
const upload = multer()

router.post('/test', upload.array('files', 8), testUpload)

export default router;