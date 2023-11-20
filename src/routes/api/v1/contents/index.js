// in src/routes/api/v1/contents/index.js
import { Router } from 'express';

import multer from 'multer';
import { getBooksContentById, editBooksContentById } from './handler.js';

const MAX_UPLOAD_IMAGE = process.env.MAX_UPLOAD_IMAGE || 10;

const router = Router();
const upload = multer()

router.get('/:book_id/pages/:image_id', getBooksContentById)
router.put('/:book_id/pages/:image_id', upload.array('images', MAX_UPLOAD_IMAGE), editBooksContentById)

export default router;