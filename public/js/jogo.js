// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const modoOnline = urlParams.get('mode') === 'online';

// --- ESTADO DO JOGO ---
let pontuacaoSessao = 0;
let respostasCertas = 0;
let tempoRestante = 30;
let jogoAtivo = true;
let jogoTerminou = false; 
const PALAVRA_MESTRA = "SOLIDARIEDADE";
let palavrasDescobertas = [];

window.onload = function() {
    const form = document.querySelector('.form-resposta');
    const input = document.getElementById('input-resposta');
    const displayPontos = document.getElementById('pontos-valor');
    const displayTempo = document.getElementById('tempo-valor');

    // 📢 AVISAR ENTRADA NO MODO ONLINE
    if (modoOnline && roomId && typeof socket !== 'undefined') {
        console.log("Conectando à sala:", roomId);
        socket.emit('joinRoom', roomId);
    }

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); 

            if (!jogoAtivo) return;

            const tentativa = input.value.trim().toUpperCase();

            // Validações
            if (tentativa === PALAVRA_MESTRA || palavrasDescobertas.includes(tentativa)) {
                processarErro(input);
                return;
            }

            if (tentativa.length > 0 && validarSequencia(PALAVRA_MESTRA, tentativa)) {
                palavrasDescobertas.push(tentativa);
                processarAcerto(tentativa, input, displayPontos);
            } else {
                processarErro(input);
            }
        });
    }

    // --- TEMPORIZADOR ---
    const contador = setInterval(() => {
        if (tempoRestante > 0) {
            tempoRestante--;
            if (displayTempo) displayTempo.innerText = tempoRestante + "s";
        } else {
            clearInterval(contador);
            jogoAtivo = false;
            if (input) input.disabled = true;

            // Finalizar e enviar pontos
            if (!jogoTerminou) {
                jogoTerminou = true;
                alert("Fim de jogo! Pontuação: " + pontuacaoSessao);

                const finalPontos = document.getElementById('input-pontos-finais');
                const finalCertas = document.getElementById('input-certas-finais');
                
                if (finalPontos && finalCertas) {
                    finalPontos.value = pontuacaoSessao;
                    finalCertas.value = respostasCertas;
                    document.getElementById('form-fim-jogo').submit();
                }
            }
        }
    }, 1000);
};

// --- LÓGICA DE VALIDAÇÃO ---
function validarSequencia(mestre, sub) {
    let indiceMestre = 0;
    for (let i = 0; i < sub.length; i++) {
        let posicao = mestre.indexOf(sub[i], indiceMestre);
        if (posicao === -1) return false;
        indiceMestre = posicao + 1;
    }
    return true;
}

// --- PROCESSAMENTO DE RESPOSTAS ---
function processarAcerto(palavra, input, display) {
    pontuacaoSessao += palavra.length * 10;
    respostasCertas++;
    display.innerText = pontuacaoSessao + " pontos";

    // 📢 ENVIAR PONTOS PARA O SERVIDOR EM TEMPO REAL
    if (modoOnline && typeof socket !== 'undefined') {
        const nomeUser = document.getElementById('nome-user-logado')?.innerText || "Adversário";
        socket.emit('playerScored', { 
            roomId: roomId, 
            pontos: pontuacaoSessao,
            username: nomeUser
        });
    }

    input.classList.add('input-acerto');
    resetInput(input);
}

function processarErro(input) {
    input.classList.add('input-erro');
    resetInput(input);
}

function resetInput(input) {
    setTimeout(() => {
        input.value = "";
        input.classList.remove('input-acerto', 'input-erro');
        input.focus();
    }, 600);
}

// --- LÓGICA MULTIJOGADOR (SOCKETS) ---
if (typeof socket !== 'undefined') {
    // Escutar pontos dos outros
    socket.on('updateScore', (data) => {
        console.log("Adversário pontuou:", data);
        atualizarAdversario(1, data.username, data.pontos);
    });

    // Escutar novos adversários entrando
    socket.on('novoAdversario', (data) => {
        console.log("Novo adversário na sala:", data.username);
        atualizarAdversario(1, data.username, data.pontos);
    });
}

function atualizarAdversario(numeroAdversario, novoNome, novaPontuacao) {
    const elementoNome = document.getElementById(`nome-adv-${numeroAdversario}`);
    const elementoPontos = document.getElementById(`pontos-adv-${numeroAdversario}`);

    if (elementoNome && elementoPontos) {
        elementoNome.innerText = novoNome;
        elementoPontos.innerText = novaPontuacao + " pts";
    }
}