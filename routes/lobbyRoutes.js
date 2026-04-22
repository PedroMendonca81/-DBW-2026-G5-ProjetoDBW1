import express from 'express';
import { getLobby, getMode } from '../controllers/lobbyController.js';

const router = express.Router();

// Rota para a página principal do Lobby
router.get('/lobby', getLobby);


export default router;