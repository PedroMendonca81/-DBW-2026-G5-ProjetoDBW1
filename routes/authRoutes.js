import express from 'express';

// A MAGIA ESTÁ AQUI: Tens de importar as 4 funções, e não apenas 2!
import { getLogin, getSignUp, postLogin, postSignUp } from '../controllers/authController.js';

const router = express.Router();

router.get('/login', getLogin);
router.post('/login', postLogin);

router.get('/register', getSignUp);
router.post('/signup', postSignUp);

export default router;