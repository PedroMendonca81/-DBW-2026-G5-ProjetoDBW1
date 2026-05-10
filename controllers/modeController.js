import User from "../models/user.js";

export const getMode = async (req, res) => {
    try {
        if (!req.session.usernameLogado) {
            return res.redirect('/login');
        }

        // Procurar o utilizador para esta página também
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        res.render('mode', { 
            tipo: 'completo', 
            user: utilizadorAtual 
        });

    } catch (error) {
        res.redirect('/lobby');
    }
};