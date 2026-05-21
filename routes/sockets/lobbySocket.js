export const salasAtivas = {
    "1": { id: "1", nome: "SALA DOS PRÓS", jogadores: 0, max: 4 },
    "2": { id: "2", nome: "MATRIOSKA AMADORES", jogadores: 0, max: 4 },
    "3": { id: "3", nome: "TREINO RÁPIDO", jogadores: 0, max: 4 }
};

export default (io) => {
    io.on('connection', (socket) => {
        // Envia as salas logo que alguém se liga
        socket.emit('atualizarLobby', salasAtivas);

        // Quando um jogador pede para entrar numa sala
        socket.on('joinRoom', (data) => {
            let id;
            let nomeUser = "Adversário";

            // Deteta se recebeu o pacote novo (Objeto) ou o antigo (String)
            if (typeof data === 'object') {
                id = String(data.room);
                nomeUser = data.username;
            } else {
                id = String(data);
            }

            if (salasAtivas[id]) {
                socket.join(id);
                socket.salaAtual = id;      // Guarda a sala na memória deste utilizador
                socket.username = nomeUser; // Guarda o nome na memória deste utilizador

                salasAtivas[id].jogadores++;
                
                // 1. AVISA O LOBBY: Faz a soma subir (0 para 1)
                io.emit('atualizarLobby', salasAtivas);

                // 2. AVISA OS CARTÕES: Substitui o "Aguardando..." pelo nome
                socket.to(id).emit('novoAdversario', {
                    username: nomeUser,
                    pontos: 0
                });

                console.log(` ${nomeUser} entrou na Sala ${id}. Total: ${salasAtivas[id].jogadores}`);
            }
        });

        // Quando alguém pontua no jogo
        socket.on('playerScored', (data) => {
            // Repassa os pontos para toda a gente que está na mesma sala
            socket.to(data.roomId).emit('updateScore', data);
        });

        // Quando o jogador fecha a aba ou clica no Voltar
        socket.on('disconnect', () => {
            const id = socket.salaAtual;
            if (id && salasAtivas[id]) {
                salasAtivas[id].jogadores--;
                if (salasAtivas[id].jogadores < 0) salasAtivas[id].jogadores = 0;
                
                // Atualiza o Lobby para subtrair a pessoa
                io.emit('atualizarLobby', salasAtivas);
                
                console.log(` ${socket.username || 'Um jogador'} saiu da Sala ${id}. Restam: ${salasAtivas[id].jogadores}`);
            }
        });
    });
};