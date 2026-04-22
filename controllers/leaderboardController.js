
import currentUser from "../models/user.js"; 

export const getLeaderboard = (req, res) => {
    
    
    const listaTop = [
        { username: "MestreDasPalavras", pontos: 950 },
        { username: "NinjaMatrioska", pontos: 820 },
        { username: "NoobZilla", pontos: 410 },
        { username: "LoboSolitario", pontos: 300 },
        { username: "Camper123", pontos: 150 }
    ];

    
    res.render('leaderboard', { user: currentUser, topJogadores: listaTop });
};