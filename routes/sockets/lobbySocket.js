export const salasAtivas = {
    "1": { id: "1", nome: "SALA DOS PRÓS", jogadores: 0, max: 4 },
    "2": { id: "2", nome: "MATRIOSKA AMADORES", jogadores: 0, max: 4 },
    "3": { id: "3", nome: "TREINO RÁPIDO", jogadores: 0, max: 4 }
};

export default (io) => {
    io.on('connection', (socket) => {
        socket.emit('atualizarLobby', salasAtivas);

        socket.on('joinRoom', (roomName) => {
            const id = String(roomName);
            if (salasAtivas[id]) {
                socket.join(id);
                socket.salaAtual = id;
                salasAtivas[id].jogadores++;

                // 📢 AVISAR O LOBBY
                io.emit('atualizarLobby', salasAtivas);

                // 📢 NOVIDADE: Avisar os outros jogadores na sala que tu entraste
                // (Isto faz o "Aguardando..." mudar para o teu nome no outro browser)
                socket.to(id).emit('novoAdversario', {
                    username: "Novo Jogador", // Podes passar o nome real se tiveres
                    pontos: 0
                });

                console.log(`✅ Sala ${id}: ${salasAtivas[id].jogadores} jogadores`);
            }
        });

        socket.on('disconnect', () => {
            const id = socket.salaAtual;
            if (id && salasAtivas[id]) {
                salasAtivas[id].jogadores--;
                if (salasAtivas[id].jogadores < 0) salasAtivas[id].jogadores = 0;
                io.emit('atualizarLobby', salasAtivas);
            }
        });
    });
};