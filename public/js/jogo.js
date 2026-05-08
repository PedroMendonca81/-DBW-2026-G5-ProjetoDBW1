// --- ESTADO DO JOGO ---
let pontuacaoSessao = 0;
let respostasCertas = 0;
let tempoRestante = 30;
let jogoAtivo = true;
const PALAVRA_MESTRA = "SOLIDARIEDADE";
let palavrasDescobertas = [];

window.onload = function() {
    const form = document.querySelector('.form-resposta');
    const input = document.getElementById('input-resposta');
    const displayPontos = document.getElementById('pontos-valor');
    const displayTempo = document.getElementById('tempo-valor');

    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede o erro de POST no meio do jogo

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

            alert("Fim de jogo! Pontuação: " + pontuacaoSessao);

            // ENVIO FINAL PARA O SERVIDOR
            document.getElementById('input-pontos-finais').value = pontuacaoSessao;
            document.getElementById('input-certas-finais').value = respostasCertas;
            document.getElementById('form-fim-jogo').submit();
        }
    }, 1000);
};

function validarSequencia(mestre, sub) {
    let indiceMestre = 0;
    for (let i = 0; i < sub.length; i++) {
        let posicao = mestre.indexOf(sub[i], indiceMestre);
        if (posicao === -1) return false;
        indiceMestre = posicao + 1;
    }
    return true;
}

function processarAcerto(palavra, input, display) {
    pontuacaoSessao += palavra.length * 10;
    respostasCertas++;
    display.innerText = pontuacaoSessao + " pontos";
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

// =========================================
// LÓGICA MULTIJOGADOR (PREPARAÇÃO PARA SOCKETS)
// =========================================

/* * Função preparada para o Diogo usar com o Socket.io.
 * Sempre que o servidor avisar que alguém pontuou, 
 * chamamos esta função para atualizar o ecrã na hora!
 */
function atualizarAdversario(numeroAdversario, novoNome, novaPontuacao) {
    const elementoNome = document.getElementById(`nome-adv-${numeroAdversario}`);
    const elementoPontos = document.getElementById(`pontos-adv-${numeroAdversario}`);

    // Só atualiza se as caixas existirem no ecrã (ou seja, se estivermos no modo online)
    if (elementoNome && elementoPontos) {
        elementoNome.innerText = novoNome;
        elementoPontos.innerText = novaPontuacao + " pts";
        
        // BÓNUS DE UX: Um pequeno flash dourado para chamar a atenção
        // de que o adversário acabou de ganhar pontos!
        elementoPontos.style.color = "#FFD700"; 
        setTimeout(() => {
            elementoPontos.style.color = "#35bdbd"; // Volta ao ciano normal
        }, 500);
    }
}