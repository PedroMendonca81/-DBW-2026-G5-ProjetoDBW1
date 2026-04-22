// controllers/profileController.js
import currentUser from "../models/user.js";

// Mostra o ecrã principal do perfil
const showProfile = function (req, res) {
    res.render("profile", { user: currentUser });
};

// Mostra o ecrã de mudar a foto
const showPfpForm = function (req, res) {
    res.render("changePfp", { user: currentUser });
};

// Recebe o formulário e atualiza a foto
const updatePfp = function (req, res) {
    const novaImagem = req.body.novaPfp;
    
    if (novaImagem) {
        currentUser.pfp = novaImagem; // Atualiza no nosso modelo
    }
    
    // Volta para o perfil para vermos a imagem nova!
    res.redirect("/profile");
};

export { showProfile, showPfpForm, updatePfp };