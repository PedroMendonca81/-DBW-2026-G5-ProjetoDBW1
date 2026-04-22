// routes/profileRoutes.js
import express from "express";
import { showProfile, showPfpForm, updatePfp } from "../controllers/profileController.js";

const router = express.Router();

router.get("/", showProfile);               // Entrar em /profile
router.get("/change-pfp", showPfpForm);     // Entrar em /profile/change-pfp
router.post("/change-pfp", updatePfp);      // Quando clicas no botão Submit do formulário

export default router;