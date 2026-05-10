export const salasAtivas = {
    "1": { id: "1", nome: "SALA DOS PRÓS", jogadores: 0, max: 4 },
    "2": { id: "2", nome: "MATRIOSKA AMADORES", jogadores: 0, max: 4 },
    "3": { id: "3", nome: "TREINO RÁPIDO", jogadores: 0, max: 4 }
};

export default (io) => {
    io.on('connection', (socket) => {
        // Quando alguém abre o Lobby, recebe os números atuais
        socket.emit('atualizarLobby', salasAtivas);

        // Quando alguém entra no JOGO
        socket.on('joinRoom', (roomId) => {
            const id = String(roomId);
            if (salasAtivas[id]) {
                socket.join(id);
                socket.salaAtual = id;
                salasAtivas[id].jogadores++;
                
                // 📢 Avisa toda a gente que o número mudou
                io.emit('atualizarLobby', salasAtivas);
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