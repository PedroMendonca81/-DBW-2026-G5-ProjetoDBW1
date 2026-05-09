import User from "../models/user.js"; // Não te esqueças desta linha no topo!

export const getLobby = async (req, res) => {
    try {
        if (!req.session.usernameLogado) {
            return res.redirect('/login');
        }

        // Vai à Base de Dados procurar o teu utilizador (que tem a foto nova!)
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        // Passa o "utilizadorAtual" para a página do lobby!
        res.render("lobby", { 
            tipo: 'completo', 
            user: utilizadorAtual 
        });

    } catch (error) {
        console.error("Erro ao carregar o lobby:", error);
        res.redirect('/login');
    }
};
export const getMode = (req, res) => {
    // Aqui estamos a enviar o 'user' para a página mode
    res.render('mode', { 
        user: currentUser 
    });
};