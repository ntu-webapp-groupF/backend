// in src/routes/api/v1/books/index.js
import { Router } from 'express';
import { createBooks, deleteBooks, getAllBooks, editBooksInfo, purchaseBooks, addBooksCollection} from './handler.js';
import { getRecommendBooks,getCollectionBooks,getBooksByAgeRange,getBooksByPriceRange,getPurchasedBooks } from './handler.js';

import multer from 'multer';

const MAX_UPLOAD_IMAGE = process.env.MAX_UPLOAD_IMAGE || 10;

const router = Router();
const upload = multer()

router.post('/', upload.array('images', MAX_UPLOAD_IMAGE), createBooks);
router.delete('/:book_id', deleteBooks);
router.get('/', getAllBooks);
router.put('/edit/:id', editBooksInfo);
router.post('/purchased/:book_id', purchaseBooks);
router.post('/collection/:book_id', addBooksCollection);
router.get('/recommends', getRecommendBooks);
router.get('/collections', getCollectionBooks);
router.get('/age/:age1/:age2', getBooksByAgeRange);
router.get('/price/:price1/:price2', getBooksByPriceRange);
router.get('/purchased', getPurchasedBooks);


export default router;