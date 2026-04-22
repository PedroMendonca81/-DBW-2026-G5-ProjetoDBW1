
import currentUser from "../models/user.js"; // 1. Importamos a "base de dados"


export const getLogin = (req, res) => {
    res.render('login');
}

export const getSignUp = (req, res) => {
    res.render('signUp');
}


export const postLogin = (req, res) => {
    
    const nomeInserido = req.body.username;

    
    if (nomeInserido) {
        currentUser.username = nomeInserido; 
    }

    
    res.redirect('/lobby');
}

export const postSignUp = (req, res) => {
    res.redirect('/login'); 
}