import session from "express-session";
import mongoose from "mongoose";
import methodOverride from "method-override";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http"; // 👈 ADICIONADO PARA O TEU SOCKET.IO
import { Server } from "socket.io"; // 👈 ADICIONADO PARA O TEU SOCKET.IO

import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import modeRoutes from "./routes/modeRoute.js";
import lobbyRoutes from "./routes/lobbyRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

const app = express();
const server = http.createServer(app); // 👈 O TEU SERVIDOR HTTP CRIADO AQUI
const io = new Server(server, { cors: { origin: "*" } }); // 👈 SOCKET.IO INICIADO AQUI

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Configurar o EJS e os Formulários
app.use(session({
    secret: "o_segredo_da_matrioska_2026", // Uma chave secreta para encriptar a sessão
    resave: false,
    saveUninitialized: false
}));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
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

// ==========================================
// 🎮 AQUI COMEÇA A TUA PARTE: MESTRE DO SERVIDOR
// ==========================================
const gameRooms = {};

io.on('connection', (socket) => {
    console.log(`🟢 Novo jogador conectado: ${socket.id}`);

    // Missão: Salas
    socket.on('joinRoom', (roomName) => {
        socket.join(roomName);
        console.log(`🚪 Jogador ${socket.id} entrou na sala: ${roomName}`);

        if (!gameRooms[roomName]) {
            gameRooms[roomName] = { time: 60, timerId: null };
            iniciarTemporizador(roomName);
        }
    });

    // Missão: Broadcast (Transmissão)
    socket.on('playerScored', (data) => {
        console.log(`⭐ Pontos na sala ${data.room}: ${data.points}`);
        io.to(data.room).emit('updateScore', data);
    });

    socket.on('disconnect', () => {
        console.log(`🔴 Jogador desconectado: ${socket.id}`);
    });
});

// Missão: Temporizador Global
function iniciarTemporizador(roomName) {
    gameRooms[roomName].timerId = setInterval(() => {
        gameRooms[roomName].time--;
        io.to(roomName).emit('timeUpdate', gameRooms[roomName].time);

        if (gameRooms[roomName].time <= 0) {
            clearInterval(gameRooms[roomName].timerId);
            io.to(roomName).emit('gameOver', 'O tempo acabou!');
            delete gameRooms[roomName];
        }
    }, 1000);
}
// ==========================================
// 🛑 FIM DA TUA PARTE
// ==========================================

const dbURI = "mongodb+srv://projectx:mendonca67@cluster1.wvohqrm.mongodb.net/?appName=Cluster1";

mongoose.connect(dbURI) 
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso!"); 
  })
  .catch((err) => {
    console.error("Erro na ligação à base de dados:", err); 
  });

// 4. LIGAR O SERVIDOR (Trocámos app.listen por server.listen para o Socket.io funcionar)
server.listen(3000, () => {
    console.log("Servidor Matrioska a correr na porta 3000! 🚀");
});