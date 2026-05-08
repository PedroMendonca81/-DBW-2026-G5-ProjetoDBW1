document.addEventListener("DOMContentLoaded", function() {
    // Selecionamos a "tela" que criámos no HTML
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');

    // Criamos os nossos MOCK DATA (Dados falsos para testar o design)
    // No futuro, isto virá do MongoDB do Aluno 1
    const ultimosJogos = ['Jogo 1', 'Jogo 2', 'Jogo 3', 'Jogo 4', 'Jogo 5'];
    const pontuacoes = [150, 80, 220, 310, 190]; 

    // Desenhamos o Gráfico
    new Chart(ctx, {
        type: 'line', // Podes mudar para 'line' se preferires um gráfico de linhas!
        data: {
            labels: ultimosJogos,
            datasets: [{
                label: 'Pontuação',
                data: pontuacoes,
                backgroundColor: '#35bdbd', // O nosso ciano do jogo
                borderColor: 'black',       // Borda preta retro
                borderWidth: 3              // Borda bem grossa a combinar com o UI
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            family: 'Arial',
                            size: 14,
                            weight: 'bold'
                        },
                        color: 'black'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: 'black', font: { weight: 'bold' } },
                    grid: { color: '#ccc' }
                },
                x: {
                    ticks: { color: 'black', font: { weight: 'bold' } },
                    grid: { display: false }
                }
            }
        }
    });
});