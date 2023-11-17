// in src/routes/api/v1/users/index.js
import { Router } from 'express';
import { getCurrentUser, registerHandler, loginHandler, logoutHandler, updateHandler, addMember } from './handler.js';

const router = Router();

router.get('/', getCurrentUser);

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.post('/logout', logoutHandler);

router.put('/update', updateHandler);

router.post('/add/:id', addMember)

export default router;