// js/alertes.js - Logique de gestion des alertes
let allAlertes = [];
let currentAlertFilter = 'all';

// Charger toutes les alertes
async function loadAllAlerts() {
    const data = await fetchAPI('/alertes/non-resolues');
    if (data?.success) {
        allAlertes = data.alertes || [];
        filterAlerts(currentAlertFilter);
    }
}

// Filtrer les alertes par niveau
function filterAlerts(filter) {
    currentAlertFilter = filter;
    
    // Mettre à jour les boutons actifs
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Filtrer les alertes
    let filtered = [...allAlertes];
    if (filter === 'critical') {
        filtered = filtered.filter(a => a.niveau === 'critical');
    } else if (filter === 'warning') {
        filtered = filtered.filter(a => a.niveau === 'warning');
    }
    
    // Afficher dans le conteneur
    const container = document.getElementById('allAlertsList');
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">✅ Aucune alerte</div>';
        return;
    }
    
container.innerHTML = filtered.map(a => `
    <div class="alert-item ${a.niveau}" style="padding:15px; margin-bottom:10px; border-radius:12px; background:${a.niveau === 'critical' ? '#fee2e2' : '#fef3c7'}; border-left:4px solid ${a.niveau === 'critical' ? '#dc2626' : '#f59e0b'}">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span class="alert-icon">⚠️</span>
            <strong style="font-size: 1.1rem;">${a.alert_message}</strong>
        </div>
        <p><strong>👤 Employé:</strong> ${a.employeNom || 'Inconnu'}</p>
        <p><strong> Date:</strong> ${new Date(a.created_at).toLocaleString()}</p>
        <p><strong>Niveau:</strong> <span class="badge ${a.niveau}">${a.niveau === 'critical' ? 'CRITIQUE' : 'ATTENTION'}</span></p>
    </div>
`).join('');
}

// Résoudre une alerte
async function resoudreAlerte(id) {
    const data = await fetchAPI(`/alertes/${id}/resoudre`, { method: 'PUT' });
    if (data?.success) {
        showToast('Alerte résolue', 'success');
        loadAllAlerts();
    } else {
        showToast('Erreur lors de la résolution', 'error');
    }
}

// Initialisation de la page alertes
document.addEventListener('DOMContentLoaded', () => {
    loadAllAlerts();
});
