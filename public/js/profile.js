document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById('graficoEvolucao').getContext('2d');

    // 1. Lemos os dados reais. Se a pessoa nunca jogou, mostramos apenas um [0] para o gráfico não dar erro.
    const pontuacoes = historicoRealBD.length > 0 ? historicoRealBD : [0];

    // 2. Criamos as etiquetas (Labels) automaticamente ("Jogo 1", "Jogo 2"...) 
    // com base no tamanho do histórico.
    const ultimosJogos = pontuacoes.map((pontos, index) => `Jogo ${index + 1}`);

    // Desenhamos o Gráfico com os dados reais!
    new Chart(ctx, {
        type: 'line', 
        data: {
            labels: ultimosJogos, // Agora isto cresce automaticamente!
            datasets: [{
                label: 'Pontuação Real',
                data: pontuacoes, // Aqui entram os dados da Base de Dados!
                backgroundColor: '#35bdbd', 
                borderColor: 'black',       
                borderWidth: 3              
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