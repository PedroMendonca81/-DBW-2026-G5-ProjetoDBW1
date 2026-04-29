
import currentUser from "../models/user.js"; // Importar a nossa "Base de Dados"

export const getGame = (req, res) => {
   
    res.render('game', {
        title: 'Jogo - Matrioska',
        tipo: 'jogo',
        user: currentUser 
    });
}



export const postFimJogo = (req, res) => {
    
    const pontosGanhos = parseInt(req.body.pontosFinais);
    const respostasGanhas = parseInt(req.body.certasFinais);

    
    if (pontosGanhos > 0) {
        currentUser.pontuacao = currentUser.pontuacao + pontosGanhos;
        currentUser.respostasCertas = currentUser.respostasCertas + respostasGanhas;
    }

    
    res.redirect('/leaderboard');


}
export const getOnlineLobby = (req, res) => {
    // Para a 1ª fase, criamos uma lista de salas fictícia (Fake Data)
    const salasDisponiveis = [
        { id: 1, nome: "Sala dos Prós", jogadores: 3, max: 4 },
        { id: 2, nome: "Matrioska Amadores", jogadores: 1, max: 4 },
        { id: 3, nome: "Treino Rápido", jogadores: 4, max: 4 }, // Sala cheia
    ];

    res.render('game_online_lobby', { 
        user: currentUser,    
        salas: salasDisponiveis
    });
};  