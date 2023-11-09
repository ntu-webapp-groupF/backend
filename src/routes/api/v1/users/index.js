// in src/routes/api/v1/users/index.js
import { Router } from 'express';
import { getAllUsers } from './handler.js';

const router = Router();

//TODO: add something here
router.get('/', getAllUsers);


export default router;