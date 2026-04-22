import express from "express";
import { getMode } from "../controllers/modeController.js";

const router = express.Router();

router.get('/mode', getMode);

export default router;