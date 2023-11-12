// in src/routes/api/v1/users/index.js
import { Router } from 'express';
import { getAllUsers, registerHandler, loginHandler } from './handler.js';

const router = Router();

//TODO: add something here
router.get('/', getAllUsers);

router.post('/register', registerHandler);

router.post('/login', loginHandler);

export default router;