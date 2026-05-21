import User from "../models/user.js";
// 1. IMPORTAÇÃO: Garante que o caminho está 100% igual ao do app.js
import { salasAtivas } from "../routes/sockets/lobbySocket.js"; 

export const getLobby = async (req, res) => {
    try {
        if (!req.session.usernameLogado) return res.redirect('/login');
        
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        res.render("lobby", { 
            tipo: 'completo', 
            user: utilizadorAtual 
        });
    } catch (error) {
        console.error("Erro ao carregar o lobby:", error);
        res.redirect('/login');
    }
};

// --- ROTA DO LOBBY ONLINE ---
export const getOnlineLobby = async (req, res) => {
    try {
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();
        
        //  Lê o objeto que o Socket está a atualizar
        const salasVivas = req.app.get('salasCompartilhadas'); 

        res.render('game_online_lobby', { 
            tipo: 'completo', 
            user: utilizadorAtual,
            salas: salasVivas 
        });
    } catch (error) {
        res.redirect('/mode');
    }
};
export const getMode = async (req, res) => {
    try {
        if (!req.session.usernameLogado) return res.redirect('/login');
        
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        res.render('mode', { 
            title: 'Escolher Modo - Matrioska',
            tipo: 'completo', 
            user: utilizadorAtual
        });
    } catch (error) {
        console.error("Erro no getMode:", error);
        res.redirect('/lobby');
    }
};