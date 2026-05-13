import User from "../models/user.js"; // 1. Importar o MODELO Mongoose real

export const getLogin = (req, res) => {
    res.render('login', { errorMessage: null });
}

export const getSignUp = (req, res) => {
    res.render('signUp');
}

export const getLogout = (req, res) => {
    req.session.destroy(() => {
        console.log("Sessão terminada. Utilizador fez logout.");
        res.redirect('/login');
    });
};

// -----------------------------------------
// SIGN UP (REGISTO) - Operação CREATE
// -----------------------------------------
export const postSignUp = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // 1. Verificar se as palavras-passe coincidem
        if (password !== confirmPassword) {
            console.log("As palavras-passe não coincidem!");
            return res.redirect('/signup'); // Volta ao formulário
        }

        // 2. Extrai os dados do formulário e cria o documento
        // O req.body já traz o email lá dentro
        const novoUtilizador = new User({
             username: username,
             email: email,
             password: password
        }); 
        
        // 3. Grava na Base de Dados
        await novoUtilizador.save(); // [cite: 364]
        
        console.log("Novo jogador registado:", novoUtilizador.username);
        res.redirect('/login'); 

    } catch (error) {
        console.error("Erro ao registar o jogador:", error);
        res.redirect('/signup'); 
    }
}

// -----------------------------------------
// LOGIN - Operação READ (Encontrar e Verificar)
// -----------------------------------------
export const postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        const utilizadorDb = await User.findOne({ username: username }).exec();

        if (utilizadorDb && utilizadorDb.password === password) {
            console.log("Login com sucesso para:", utilizadorDb.username);
            req.session.usernameLogado = utilizadorDb.username;
            res.redirect('/lobby'); 
        } else {
            // 🚨 EM VEZ DE REDIRECT, RENDERIZAMOS A PÁGINA COM O ERRO
            console.log("Credenciais inválidas.");
            res.render('login', { errorMessage: "Nome de utilizador ou palavra-passe incorretos." });
        }
    } catch (error) {
        console.error("Erro ao efetuar login:", error);
        // Em caso de falha de base de dados, avisamos o utilizador
        res.render('login', { errorMessage: "Erro de ligação ao servidor. Tenta novamente." });
    }
}
