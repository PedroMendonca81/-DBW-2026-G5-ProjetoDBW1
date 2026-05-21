// --- CONFIGURAÇÃO INICIAL ---
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get('room');
const modoOnline = urlParams.get('mode') === 'online';

// --- EFEITOS SONOROS ---
const somAcerto = new Audio('/sounds/acerto.mp3');
const somErro = new Audio('/sounds/erro.mp3');
const somTick = new Audio('/sounds/relogio.mp3');

// --- ESTADO DO JOGO ---
let pontuacaoSessao = 0;
let respostasCertas = 0;
let respostasErradas = 0; //  NOVIDADE: Variável para contar os erros
let tempoTotalInicial = 30; //  NOVIDADE: Guarda o tempo inicial para sabermos quanto passou
let tempoRestante = tempoTotalInicial;
let jogoAtivo = true;
let jogoTerminou = false; 

// --- O NOSSO DICIONÁRIO DO JOGO ---
const BANCO_PALAVRAS = [
    {
        mestra: "SOLIDARIEDADE",
        validas: ["SOL", "LIDA", "DAR", "REDE", "IDADE", "DADO", "DOR", "RIA", "DIA", "SER", "RIO", "AR", "ERA", "DEDO", "LIDE"]
    },
    {
        mestra: "PROGRAMADOR",
        validas: ["PRO", "GRAMA", "AMOR", "DOR", "RODA", "ROMA", "PODA", "PAR", "POR", "MAR", "DOM", "PRADO", "MACA" , "PROGRAMA", "AMADOR"]
    },
    {
        mestra: "COMPUTADOR",
        validas: ["COM", "COR", "DOR", "POR", "ATOR", "ROTA", "RODA", "DOAR", "PAR", "PUM", "MUTA", "PODA", "TOCAR", "COMPOTA", "PATO", "MORO", "COTA"]
    }
];

// Escolhe um jogo à sorte sempre que a página carrega
const jogoAtual = BANCO_PALAVRAS[Math.floor(Math.random() * BANCO_PALAVRAS.length)];
const PALAVRA_MESTRA = jogoAtual.mestra;

let palavrasDescobertas = [];

window.onload = function() {
    const form = document.querySelector('.form-resposta');
    const input = document.getElementById('input-resposta');
    const displayPontos = document.getElementById('pontos-valor');
    const displayTempo = document.getElementById('tempo-valor');

    const tituloPalavra = document.querySelector('.palavra-mestra');
    if (tituloPalavra) {
        tituloPalavra.innerText = PALAVRA_MESTRA;
    }

    //  AVISAR ENTRADA NO MODO ONLINE
    if (modoOnline && roomId && typeof socket !== 'undefined') {
        const nomeUserLogado = document.getElementById('nome-user-logado')?.innerText || "Jogador";
        console.log("Conectando à sala:", roomId, "como", nomeUserLogado);
        
        socket.emit('joinRoom', { 
            room: roomId, 
            username: nomeUserLogado 
        });
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

            if (tentativa.length > 0 && validarSequencia(PALAVRA_MESTRA, tentativa) && jogoAtual.validas.includes(tentativa)) {
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
            if (tempoRestante <= 8 && tempoRestante > 0) {
                somTick.play();
            }
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
                const finalErradas = document.getElementById('input-erradas-finais'); // 🚨 NOVIDADE
                const finalTempo = document.getElementById('input-tempo-final'); // 🚨 NOVIDADE
                
                // Calculamos o tempo gasto subtraindo o restante ao inicial
                const tempoGasto = tempoTotalInicial - tempoRestante; 

                if (finalPontos && finalCertas && finalErradas && finalTempo) {
                    finalPontos.value = pontuacaoSessao;
                    finalCertas.value = respostasCertas;
                    finalErradas.value = respostasErradas; // 🚨 NOVIDADE: Adiciona as erradas ao form
                    finalTempo.value = tempoGasto; // 🚨 NOVIDADE: Adiciona o tempo ao form
                    
                    document.getElementById('form-fim-jogo').submit();
                } else {
                    console.error("ERRO: Formulário final ou inputs não encontrados!");
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
    somAcerto.play();
    pontuacaoSessao += palavra.length * 10;
    respostasCertas++;
    display.innerText = pontuacaoSessao + " pontos";

    //  ENVIAR PONTOS PARA O SERVIDOR EM TEMPO REAL
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
    somErro.play();
    respostasErradas++; 
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
        atualizarPosicaoAdversario(data.username, data.pontos);
    });

    // Escutar novos adversários entrando
    socket.on('novoAdversario', (data) => {
        console.log("Novo adversário na sala:", data.username);
        atualizarPosicaoAdversario(data.username, data.pontos);

        const meuNome = document.getElementById('nome-user-logado')?.innerText || "Jogador";
        socket.emit('playerScored', { 
            roomId: roomId, 
            pontos: pontuacaoSessao,
            username: meuNome
        });
    });
}

//  FUNÇÃO INTELIGENTE: Gere os 3 espaços ("slots") de adversários
function atualizarPosicaoAdversario(nome, pontos) {
    let slotVazio = null;

    for (let i = 1; i <= 3; i++) {
        const elNome = document.getElementById(`nome-adv-${i}`);
        const elPontos = document.getElementById(`pontos-adv-${i}`);

        if (elNome && elPontos) {
            if (elNome.innerText.toUpperCase() === nome.toUpperCase()) {
                elPontos.innerText = `${pontos} pts`;
                
                elPontos.style.color = "#FFD700"; 
                setTimeout(() => elPontos.style.color = "#35bdbd", 500);
                return; 
            }
            
            if (elNome.innerText.includes("AGUARDANDO") && !slotVazio) {
                slotVazio = { nome: elNome, pontos: elPontos };
            }
        }
    }

    if (slotVazio) {
        slotVazio.nome.innerText = nome.toUpperCase();
        slotVazio.pontos.innerText = `${pontos} pts`;
    }
}