import session from "express-session";
import mongoose from "mongoose";
import methodOverride from "method-override";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import { Server } from "socket.io";

// --- ROTAS ---
import gameRoutes from "./routes/gameRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import modeRoutes from "./routes/modeRoute.js";
import lobbyRoutes from "./routes/lobbyRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";

// --- SOCKETS (Apenas UM import aqui resolve tudo) ---
import lobbySocket, { salasAtivas } from "./routes/sockets/lobbySocket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Ativa o socket do lobby
lobbySocket(io); 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- MIDDLEWARES ---
app.use(session({
    secret: "o_segredo_da_matrioska_2026",
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

// ==========================================
// 🎮 GESTÃO DO JOGO (Socket.io Central)
// ==========================================
const gameRooms = {};

io.on('connection', (socket) => {
    
    // 1. ENTRAR NA SALA
    socket.on('joinRoom', (roomName) => {
        const idString = String(roomName); 
        socket.join(idString);
        socket.salaAtual = idString;

        console.log(`Tentativa de entrada na sala: ${idString}`);

        if (salasAtivas && salasAtivas[idString]) {
            salasAtivas[idString].jogadores++; 
            
            // 📢 Notifica todos (Lobby e Jogo)
            io.emit('atualizarLobby', salasAtivas); 
            
            console.log(`✅ Sala ${idString} atualizada: ${salasAtivas[idString].jogadores} jogadores`);
        } else {
            console.log(`❌ Erro: Sala ${idString} não encontrada em salasAtivas`);
        }
    });

    // 2. DISCONNECT
    socket.on('disconnect', () => {
        const roomName = socket.salaAtual;
        if (roomName && salasAtivas && salasAtivas[roomName]) {
            salasAtivas[roomName].jogadores--;
            if (salasAtivas[roomName].jogadores < 0) salasAtivas[roomName].jogadores = 0;

            io.emit('atualizarLobby', salasAtivas);
            console.log(`❌ Saída: Sala ${roomName} restam ${salasAtivas[roomName].jogadores}`);
        }
    });

    // 3. PONTOS
    socket.on('playerScored', (data) => {
        socket.to(data.roomId).emit('updateScore', data);
    });
});

// --- BASE DE DADOS E ARRANQUE ---
const dbURI = "mongodb+srv://projectx:mendonca67@cluster1.wvohqrm.mongodb.net/?appName=Cluster1";
mongoose.connect(dbURI) 
  .then(() => {
    console.log("Conectado ao MongoDB com sucesso! ✅");
    server.listen(3000, () => {
        console.log("Servidor Matrioska a correr em http://localhost:3000 🚀");
    });
  })
  .catch((err) => console.error("Erro na ligação à base de dados:", err));