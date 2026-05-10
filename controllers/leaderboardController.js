import User from "../models/user.js"; 

export const getLeaderboard = async (req, res) => {
    try {
        // 1. Procurar o utilizador logado (para o Header mostrar o perfil/nome)
        let utilizadorLogado = null;
        if (req.session.usernameLogado) {
            utilizadorLogado = await User.findOne({ username: req.session.usernameLogado }).exec();
        }

        // 2. Ir buscar os 10 melhores jogadores à BD
        // .sort({ pontuacao: -1 }) -> Ordena de forma decrescente (mais pontos primeiro)
        // .limit(10) -> Mostra apenas o Top 10
        const listaTop = await User.find()
            .sort({ pontuacao: -1 }) 
            .limit(10)
            .exec();

        // 3. Renderizar a página
        res.render('leaderboard', { 
            title: 'Classificação - Matrioska',
            user: utilizadorLogado, 
            topJogadores: listaTop,
            tipo: 'completo' // Garante que o header mostre a área do utilizador
        });

    } catch (error) {
        console.error("Erro ao carregar a Leaderboard:", error);
        res.render('leaderboard', { 
            title: 'Classificação - Matrioska',
            user: null, 
            topJogadores: [], 
            errorMessage: "Erro ao carregar os dados." 
        });
    }
};