import 'dotenv/config';
import session from "express-session";
import mongoose from "mongoose";
import methodOverride from "method-override";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";


import User from "./models/user.js"; 

// --- ROTAS ---
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import modeRoutes from "./routes/modeRoute.js";
import lobbyRoutes from "./routes/lobbyRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";


// --- SOCKETS ---
import lobbySocket, { salasAtivas } from "./routes/sockets/lobbySocket.js";


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. CONFIGURAÇÃO DAS SALAS (Ponte entre Controller e Socket)
app.set('salasCompartilhadas', salasAtivas);

// 2. CRIAÇÃO DO SERVIDOR (Apenas uma vez!)
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite qualquer origem para evitar erros de bloqueio no teste
        methods: ["GET", "POST"]
    }
});

// 3. ATIVAÇÃO DO SOCKET
lobbySocket(io); 

// --- MIDDLEWARES ---
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));


// --- DEFINIÇÃO DE ROTAS ---
app.use('/', gameRoutes);
app.use('/', authRoutes);
app.use('/', lobbyRoutes);
app.use('/', modeRoutes);
app.use('/', leaderboardRoutes);
app.use("/profile", profileRoutes);

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/profile/:username', async (req, res) => {
    try {
        const nomeClicado = req.params.username;
        const jogadorEncontrado = await User.findOne({ username: nomeClicado });

        if (!jogadorEncontrado) {
            return res.status(404).render('404', { mensagem: 'Jogador não encontrado' });
        }

        res.render('profile', { 
            user: jogadorEncontrado 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro no servidor");
    }
});


// O 404 TEM DE SER SEMPRE A ÚLTIMA ROTA ANTES DA BASE DE DADOS
app.use((req, res) => {
    res.status(404).render('404');
});


// --- BASE DE DADOS E ARRANQUE ---
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI) 
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso! ✅");
    // USAR SEMPRE server.listen e não app.listen
    server.listen(3000, () => {
        console.log("==========================================");
        console.log("🚀 Servidor Matrioska: http://localhost:3000");
        console.log("==========================================");
    });
  })
  .catch((err) => console.error("Erro na ligação à base de dados:", err));