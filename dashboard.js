let workingHoursChart = null;

// Charger toutes les données du dashboard
async function loadDashboard() {
    await loadKPIs();
    await loadWorkingHoursChart();
    await loadRecentAlerts();
}

// Charger les indicateurs KPI
async function loadKPIs() {
    try {
        // 1. Employés totaux (exclure admin)
        const employesData = await fetchAPI('/employes');
        if (employesData?.success) {
            const employesNormaux = employesData.employes.filter(e => e.role !== 'admin');
            const totalEmployesEl = document.getElementById('totalEmployes');
            if (totalEmployesEl) totalEmployesEl.innerHTML = employesNormaux.length;
        }
        
        // 2. Heures totales et BPM moyen
        const statsData = await fetchAPI('/stats');
        if (statsData?.success) {
            const totalHeuresEl = document.getElementById('totalHeures');
            const bpmMoyenEl = document.getElementById('bpmMoyen');
            if (totalHeuresEl) totalHeuresEl.innerHTML = statsData.stats.totalHeuresMois || 0;
            if (bpmMoyenEl) bpmMoyenEl.innerHTML = statsData.stats.bpmMoyen || '--';
            
            // Employé du mois
            if (statsData.stats.employeDuMois) {
                const emp = statsData.stats.employeDuMois;
                const empMoisNomEl = document.getElementById('empMoisNom');
                const empMoisStatsEl = document.getElementById('empMoisStats');
                const empMoisAvatarEl = document.getElementById('empMoisAvatar');
                if (empMoisNomEl) empMoisNomEl.innerHTML = `${emp.prenom} ${emp.nom}`;
                if (empMoisStatsEl) empMoisStatsEl.innerHTML = `${emp.heures} heures ce mois`;
                if (empMoisAvatarEl) empMoisAvatarEl.innerHTML = emp.prenom?.charAt(0) || '👤';
            }
            
            // Top employés
            const topEmployes = statsData.stats.topEmployes || [];
            const topContainer = document.getElementById('topEmployesList');
            if (topContainer) {
                if (topEmployes.length > 1) {
                    topContainer.innerHTML = topEmployes.slice(1, 4).map((emp, idx) => `
                        <div class="ranking-item">
                            <div class="rank-info">
                                <span class="rank-number">${String(idx + 2).padStart(2, '0')}</span>
                                <div class="rank-avatar">${emp.prenom?.charAt(0) || 'E'}</div>
                                <div>
                                    <span class="rank-name">${emp.prenom} ${emp.nom}</span>
                                    <span class="rank-val">${emp.heures} hrs</span>
                                </div>
                            </div>
                            <i class="ph ph-trend-up trend-icon"></i>
                        </div>
                    `).join('');
                } else if (topEmployes.length === 1) {
                    topContainer.innerHTML = '<div style="text-align:center; padding:20px;">En attente d\'autres employés</div>';
                } else {
                    topContainer.innerHTML = '<div style="text-align:center; padding:20px;">Aucune donnée</div>';
                }
            }
        }
        
        // 3. Alertes actives
        const alertesData = await fetchAPI('/alertes/non-resolues');
        if (alertesData?.success) {
            const totalAlertesEl = document.getElementById('totalAlertes');
            if (totalAlertesEl) totalAlertesEl.innerHTML = alertesData.alertes.length;
        }
    } catch (error) {
        console.error('Erreur chargement KPI:', error);
    }
}

// Charger le graphique des heures travaillées
async function loadWorkingHoursChart() {
    try {
        const pointagesData = await fetchAPI('/pointages');
        const canvas = document.getElementById('workingHoursChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        let heuresParJour = [0, 0, 0, 0, 0, 0, 0];
        
        // Récupérer les IDs des admins
        const employesData = await fetchAPI('/employes');
        const adminIds = [];
        if (employesData?.success) {
            employesData.employes.forEach(e => {
                if (e.role === 'admin') adminIds.push(e.id);
            });
        }
        
        if (pointagesData?.success && pointagesData.pointages) {
            pointagesData.pointages.forEach(p => {
                if (adminIds.includes(p.employeId)) return;
                if (p.check_in && p.check_out) {
                    const date = new Date(p.date);
                    const dayIndex = date.getDay();
                    const idx = dayIndex === 0 ? 6 : dayIndex - 1;
                    if (idx >= 0 && idx < 7) {
                        const [inH, inM] = p.check_in.split(':');
                        const [outH, outM] = p.check_out.split(':');
                        let hours = parseInt(outH) - parseInt(inH);
                        let minutes = parseInt(outM) - parseInt(inM);
                        if (minutes < 0) { hours--; minutes += 60; }
                        heuresParJour[idx] += hours + (minutes / 60);
                    }
                }
            });
        }
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(118,75,162,0.2)');
        gradient.addColorStop(1, 'rgba(118,75,162,0)');
        
        if (workingHoursChart) workingHoursChart.destroy();
        workingHoursChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: joursSemaine,
                datasets: [{
                    label: 'Heures travaillées',
                    data: heuresParJour,
                    borderColor: '#764ba2',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#764ba2'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } }
            }
        });
    } catch (error) {
        console.error('Erreur graphique:', error);
    }
}

// Charger les alertes récentes dans le sidebar
async function loadRecentAlerts() {
    const data = await fetchAPI('/alertes/non-resolues');
    const container = document.getElementById('alertsListAdmin');
    const countEl = document.getElementById('alertesCount');
    
    if (!container) return;
    
    if (data?.success && data.alertes?.length) {
        if (countEl) countEl.innerHTML = `(${data.alertes.length})`;
// Dans loadRecentAlerts
container.innerHTML = data.alertes.slice(0, 3).map(a => `
    <div class="alert-box ${a.niveau === 'critical' ? 'red' : 'purple'}">
        <i class="ph ph-${a.alert_type === 'high_heart_rate' ? 'heartbeat' : 'thermometer'}"></i>
        <div>
            <strong>${a.alert_message}</strong>
            <p>👤 ${a.employeNom || 'Employé'}</p>
            <small>${new Date(a.created_at).toLocaleString()}</small>
        </div>
    </div>
`).join('');
    } else {
        container.innerHTML = '<div class="alert-box"><div>Aucune alerte active</div></div>';
    }
}

// Initialisation de la page dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});
