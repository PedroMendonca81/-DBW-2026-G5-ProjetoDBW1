import express from "express";
import multer from "multer"; // 1. Importa o Multer
import { showProfile, showPfpForm, updatePfp } from "../controllers/profileController.js";

const router = express.Router();

// 2. Configura onde as imagens vão ser guardadas
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/') // Garante que esta pasta existe!
    },
    filename: function (req, file, cb) {
        // Coloca a data atual antes do nome original para ser único
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

router.get("/", showProfile);
router.get("/change-pfp", showPfpForm);

// 3. Adiciona o upload.single() na rota de POST
// O "novaPfp" tem de ser igual ao 'name' do input no teu HTML
router.post("/change-pfp", upload.single("novaPfp"), updatePfp);

export default router;