import currentUser from "../models/user.js";

export const getLobby = (req, res) => {
    // Aqui estamos a enviar o 'user' para o lobby
    res.render('lobby', { 
        user: currentUser 
    });
};

export const getMode = (req, res) => {
    // Aqui estamos a enviar o 'user' para a página mode
    res.render('mode', { 
        user: currentUser 
    });
};