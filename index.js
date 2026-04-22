import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import modeRoutes from "./routes/modeRoute.js";
import lobbyRoutes from "./routes/lobbyRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Configurar o EJS e os Formulários
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // Essencial para receber o link da nova imagem
app.use(express.static(__dirname + "/public"));
app.use('/', gameRoutes); // Rota do jogo
app.use('/', authRoutes); // Rota de autenticação
app.use('/', lobbyRoutes); // Rota da lobby
app.use('/', modeRoutes); // Rota dos modos de jogo 
app.use('/', leaderboardRoutes); // Rota da leaderboard

// 3. Dizer ao servidor para usar a tua rota quando alguém for a /profile
app.use("/profile", profileRoutes);

app.get('/', (req, res) => {
    res.redirect('/login');
});
// 4. LIGAR O SERVIDOR (É isto que impede o "clean exit"!)
app.listen(3000, () => {
    console.log("Servidor Matrioska a correr na porta 3000! 🚀");
});