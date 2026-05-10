import express from 'express';
import { getLobby, getMode } from '../controllers/lobbyController.js';

const router = express.Router();

// 1. Rota para a página principal (onde vês o teu perfil e o botão Jogar)
router.get('/lobby', getLobby);

// 2. Rota para a seleção de modos (Solo ou Online)
router.get('/mode', getMode);

export default router;