// in src/routes/api/v1/users/index.js
import { Router } from 'express';
import { getCurrentUser, registerHandler, loginHandler, updateHandler } from './handler.js';

const router = Router();

router.get('/', getCurrentUser);

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.put('/update', updateHandler);

export default router;