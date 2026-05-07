document.addEventListener('DOMContentLoaded', function() {
    // 1. Initialiser les icônes Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Configuration du graphique (Line Chart / Courbe)
    const ctx = document.getElementById('workingHoursChart').getContext('2d');
    
    // Création d'un dégradé pour la courbe
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(118, 75, 162, 0.2)');
    gradient.addColorStop(1, 'rgba(118, 75, 162, 0)');

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
            datasets: [{
                label: 'Heures travaillées',
                data: [7.5, 8.2, 7.8, 8.5, 7.0, 3.5, 1.2],
                borderColor: '#764ba2',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4, // C'est ce qui crée l'effet "courbe"
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#764ba2',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: { font: { size: 12 } }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
});
