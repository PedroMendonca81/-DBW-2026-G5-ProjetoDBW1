// controllers/profileController.js
import User from "../models/user.js"; // Importa o modelo Mongoose real [cite: 338]

// Mostra o ecrã principal do perfil
const showProfile = async function (req, res) {
    try {
        // 1. Verifica se alguém tem sessão iniciada
        if (!req.session.usernameLogado) {
            return res.redirect('/login'); // Se não tiver, expulsa para o login!
        }

        // 2. Procura na base de dados usando o nome que está na sessão
        const user = await User.findOne({ username: req.session.usernameLogado }).exec();
        
        if (user) {
            res.render("profile", { user: user });
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        res.status(500).send("Erro no servidor");
    }
};

// Mostra o ecrã de mudar a foto
const showPfpForm = async function (req, res) {
    if (!req.session.usernameLogado) return res.redirect('/login');
    const user = await User.findOne({ username: req.session.usernameLogado }).exec();
    res.render("changePfp", { user: user });
};

// Recebe o formulário e atualiza a foto (Operação UPDATE) [cite: 334]
const updatePfp = async function (req, res) {
    try {
        if (!req.session.usernameLogado) return res.redirect('/login');

        if (req.file) {
            // Usa o nome da sessão no updateOne!
            await User.updateOne(
                { username: req.session.usernameLogado }, 
                { $set: { imagemPerfil: req.file.filename } } 
            );
        }
        res.redirect("/profile");
    } catch (error) 
{
        console.error("Erro ao atualizar foto:", error);
        res.redirect("/profile");
    }
};

export { showProfile, showPfpForm, updatePfp };