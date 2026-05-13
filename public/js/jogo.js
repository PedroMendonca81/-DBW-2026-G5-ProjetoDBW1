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

// --- O NOSSO DICIONÁRIO DO JOGO ---
const BANCO_PALAVRAS = [
    {
        mestra: "SOLIDARIEDADE",
        validas: ["SOL", "LIDA", "DAR", "REDE", "IDADE", "DADO", "DOR", "RIA", "DIA", "SER", "RIO", "AR", "ERA", "DEDO", "LIDE"]
    },
    {
        mestra: "PROGRAMADOR",
        validas: ["PRO", "GRAMA", "AMOR", "DOR", "RODA", "ROMA", "PODA", "PAR", "POR", "MAR", "DOM", "PRADO", "MACA"]
    },
    {
        mestra: "COMPUTADOR",
        validas: ["COM", "COR", "DOR", "POR", "ATOR", "ROTA", "RODA", "DOAR", "PAR", "PUM", "MUTA", "PODA", "TOCAR"]
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

    // 🚨 NOVIDADE: Atualiza o HTML para mostrar a palavra sorteada em vez do texto fixo!
    const tituloPalavra = document.querySelector('.palavra-mestra');
    if (tituloPalavra) {
        tituloPalavra.innerText = PALAVRA_MESTRA;
    }

    // 📢 AVISAR ENTRADA NO MODO ONLINE
    if (modoOnline && roomId && typeof socket !== 'undefined') {
        const nomeUserLogado = document.getElementById('nome-user-logado')?.innerText || "Jogador";
        console.log("Conectando à sala:", roomId, "como", nomeUserLogado);
        
        // Envia a sala e o nome para o servidor saber quem entrou
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

            // 🚨 NOVIDADE: Adicionámos a verificação do Dicionário (jogoAtual.validas.includes)
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
        atualizarPosicaoAdversario(data.username, data.pontos);
    });

    // Escutar novos adversários entrando

    socket.on('novoAdversario', (data) => {
        console.log("Novo adversário na sala:", data.username);
        atualizarPosicaoAdversario(data.username, data.pontos);

        // 📢 O TRUQUE MÁGICO: 
        // Como o adversário acabou de entrar e o ecrã dele está vazio,
        // eu envio os meus dados atuais para o ecrã dele se preencher com o meu nome!
        const meuNome = document.getElementById('nome-user-logado')?.innerText || "Jogador";
        socket.emit('playerScored', { 
            roomId: roomId, 
            pontos: pontuacaoSessao,
            username: meuNome
        });
    });
}

// 🧠 FUNÇÃO INTELIGENTE: Gere os 3 espaços ("slots") de adversários
function atualizarPosicaoAdversario(nome, pontos) {
    let slotVazio = null;

    // Vai testar as 3 caixas (1, 2 e 3)
    for (let i = 1; i <= 3; i++) {
        const elNome = document.getElementById(`nome-adv-${i}`);
        const elPontos = document.getElementById(`pontos-adv-${i}`);

        if (elNome && elPontos) {
            // Se já existir uma caixa com o nome deste jogador, atualiza só os pontos
            if (elNome.innerText.toUpperCase() === nome.toUpperCase()) {
                elPontos.innerText = `${pontos} pts`;
                
                // Pequeno piscar amarelo para mostrar que ganhou pontos
                elPontos.style.color = "#FFD700"; 
                setTimeout(() => elPontos.style.color = "#35bdbd", 500);
                return; // Encontrou o jogador e atualizou, para a função aqui
            }
            
            // Se encontrar uma caixa livre ("AGUARDANDO..."), guarda-a na memória para usar se precisar
            if (elNome.innerText.includes("AGUARDANDO") && !slotVazio) {
                slotVazio = { nome: elNome, pontos: elPontos };
            }
        }
    }

    // Se o jogador não tinha cartão e encontramos um slot livre, escreve o nome dele lá
    if (slotVazio) {
        slotVazio.nome.innerText = nome.toUpperCase();
        slotVazio.pontos.innerText = `${pontos} pts`;
    }
}