
import User from "../models/user.js"; // Importa o Modelo real da Base de Dados
import { salasAtivas } from "../routes/sockets/lobbySocket.js"; // Importa as salas em tempo real

// --- ROTA DO JOGO (OFFLINE/SOLO) ---
export const getGame = async (req, res) => {
    try {
        // 1. Verifica se o username está na sessão
        if (!req.session.usernameLogado) {
            return res.redirect('/login');
        }

        // 2. Procura o utilizador real na BD (como fizeste no lobby)
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        const modoAtual = req.query.mode || 'solo'; 
       
        res.render('game', {
            title: 'Jogo - Matrioska',
            tipo: 'completo',    // MUITO IMPORTANTE: para o header.ejs mostrar o perfil
            user: utilizadorAtual, // Enviamos o utilizador que encontrámos na BD
            modoJogo: modoAtual 
        });

    } catch (error) {
        console.error("Erro ao carregar o jogo:", error);
        res.redirect('/lobby');
    }
}

// --- ROTA DO LOBBY ONLINE ---
export const getOnlineLobby = async (req, res) => {
    try {
        if (!req.session.usernameLogado) {
            return res.redirect('/login');
        }

        // Procura o utilizador real na BD
        const utilizadorAtual = await User.findOne({ username: req.session.usernameLogado }).exec();

        // Usa as salas em tempo real do Socket.io
        res.render('game_online_lobby', { 
            tipo: 'completo',    // Garante que o header mostre o perfil
            user: utilizadorAtual, 
            salas: salasAtivas // Usa os dados reais, não hardcoded
        });

    } catch (error) {
        console.error("Erro ao carregar o lobby online:", error);
        res.redirect('/lobby');
    }
};


// --- ROTA DE FIM DE JOGO ---
// --- ROTA DE FIM DE JOGO ---
export const postFimJogo = async (req, res) => {
    try {
        const pontosGanhos = parseInt(req.body.pontosFinais) || 0;
        const respostasGanhas = parseInt(req.body.certasFinais) || 0;
        
        // 👇 1. LÊ AS NOVAS VARIÁVEIS QUE VÊM DO JOGO 👇
        const errosCometidos = parseInt(req.body.erradasFinais) || 0;
        const tempoGasto = parseInt(req.body.tempoFinal) || 0;

        // 👇 2. REMOVI O "&& pontosGanhos > 0" para guardar o tempo mesmo com 0 pontos!
        if (req.session.usernameLogado) {
            
            await User.findOneAndUpdate(
                { username: req.session.usernameLogado },
                { 
                    $inc: { 
                        pontuacao: pontosGanhos, 
                        respostasEncontradas: respostasGanhas,
                        // 👇 3. SOMA OS ERROS E O TEMPO NA BASE DE DADOS 👇
                        respostasErradas: errosCometidos,
                        tempoTotalJogo: tempoGasto
                    },
                    // 📈 Isto faz com que o gráfico do perfil funcione!
                    $push: { 
                        historicoPontos: pontosGanhos 
                    }
                },
                // ✅ RESOLUÇÃO DO WARNING AQUI:
                { returnDocument: 'after' } 
            );
            
            console.log(`✓ ${req.session.usernameLogado} guardou: ${pontosGanhos} pts | ${errosCometidos} erros | ${tempoGasto} segs`);
        }

        res.redirect('/leaderboard');
    } catch (error) {
        console.error("Erro ao guardar pontuação:", error);
        res.redirect('/lobby');
    }
}