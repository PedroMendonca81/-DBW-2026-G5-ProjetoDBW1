import express from 'express';

// A MAGIA ESTÁ AQUI: Tens de importar as 4 funções, e não apenas 2!
import { getLogin, getSignUp, postLogin, postSignUp, getLogout } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);

router.get('/signup', getSignUp);
router.post('/signup', postSignUp);

router.get('/logout', getLogout);

export default router;