import express from "express";
import { getGame, postFimJogo, getOnlineLobby } from "../controllers/gameController.js"; 

const router = express.Router();

router.get('/game', getGame);
router.post('/game/end', postFimJogo); 
router.get('/game/online', getOnlineLobby);

export default router;