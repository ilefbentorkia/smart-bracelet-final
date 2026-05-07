let alertsEvolutionChart = null;
let topEmployesChart = null;

// Charger les rapports
async function loadRapports() {
    await loadAlertsEvolutionChart();
    await loadTopEmployesChart();
}

// Graphique d'évolution des alertes
async function loadAlertsEvolutionChart() {
    const data = await fetchAPI('/alertes/non-resolues');
    const ctx = document.getElementById('alertsEvolutionChart')?.getContext('2d');
    if (!ctx) return;
    
    // Simuler des données d'évolution (à remplacer par des vraies données historiques)
    const alertesParSemaine = [5, 8, 3, 2];
    
    if (alertsEvolutionChart) alertsEvolutionChart.destroy();
    alertsEvolutionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
            datasets: [{
                label: 'Alertes',
                data: alertesParSemaine,
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220,38,38,0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'top' } }
        }
    });
}

// Graphique Top 5 employés
async function loadTopEmployesChart() {
    const statsData = await fetchAPI('/stats');
    const ctx = document.getElementById('topEmployesChart')?.getContext('2d');
    if (!ctx) return;
    
    let employesNames = [];
    let employesHeures = [];
    
    if (statsData?.success && statsData.stats.topEmployes) {
        const top5 = statsData.stats.topEmployes.slice(0, 5);
        employesNames = top5.map(e => `${e.prenom} ${e.nom}`);
        employesHeures = top5.map(e => e.heures);
    } else {
        employesNames = ['Aucune donnée'];
        employesHeures = [0];
    }
    
    if (topEmployesChart) topEmployesChart.destroy();
    topEmployesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: employesNames,
            datasets: [{
                label: 'Heures travaillées',
                data: employesHeures,
                backgroundColor: '#764ba2',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } }
        }
    });
}

// Exporter le rapport en JSON
async function exportRapport() {
    try {
        const [employesData, alertesData, statsData] = await Promise.all([
            fetchAPI('/employes'),
            fetchAPI('/alertes/non-resolues'),
            fetchAPI('/stats')
        ]);
        
        const rapport = {
            date: new Date().toISOString(),
            generateur: 'SmartBracelet Admin',
            statistiques: statsData?.stats || {},
            employes: employesData?.employes?.filter(e => e.role !== 'admin') || [],
            alertes: alertesData?.alertes || []
        };
        
        const blob = new Blob([JSON.stringify(rapport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport-smartbracelet-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Rapport exporté avec succès', 'success');
    } catch (error) {
        console.error('Erreur export:', error);
        showToast('Erreur lors de l\'export', 'error');
    }
}

// Initialisation de la page rapports
document.addEventListener('DOMContentLoaded', () => {
    loadRapports();
});
