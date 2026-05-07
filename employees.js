let allEmployes = [];

// Charger la liste des employés
async function loadEmployes() {
    const data = await fetchAPI('/employes');
    if (data?.success) {
        allEmployes = data.employes;
        displayEmployes(allEmployes);
    }
}

// Afficher les employés dans le tableau
function displayEmployes(employes) {
    const tbody = document.getElementById('employesTableBody');
    if (!tbody) return;
    
    const employesFiltres = employes.filter(emp => emp.role !== 'admin');
    
    if (employesFiltres.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Aucun employé</td></tr>';
        return;
    }
    
    tbody.innerHTML = employesFiltres.map(emp => `
        <tr>
            <td>${emp.prenom} ${emp.nom}</td>
            <td>${emp.email}</td>
            <td>${emp.department || '-'}</td>
            <td>${emp.role === 'admin' ? '👑 Admin' : '👤 Employé'}</td>
            <td class="${emp.actif !== false ? 'status-active' : 'status-inactive'}">${emp.actif !== false ? 'ACTIF' : 'INACTIF'}</td>
            <td>
                <button class="action-btn delete-btn" onclick="deleteEmploye('${emp.id}')">
                    <i class="ph ph-trash"></i> Supprimer
                </button>
            </td>
        </tr>
    `).join('');
}

// Rechercher des employés
function searchEmployes() {
    const searchInput = document.getElementById('searchEmploye');
    if (!searchInput) return;
    
    const term = searchInput.value.toLowerCase();
    const employesFiltres = allEmployes.filter(e => e.role !== 'admin');
    const filtered = employesFiltres.filter(e =>
        e.nom?.toLowerCase().includes(term) ||
        e.prenom?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
    );
    displayEmployes(filtered);
}

// Supprimer un employé
async function deleteEmploye(id) {
    if (confirm('Supprimer définitivement cet employé ?')) {
        const data = await fetchAPI(`/employes/${id}`, { method: 'DELETE' });
        if (data?.success) {
            showToast('Employé supprimé avec succès', 'success');
            loadEmployes();
        } else {
            showToast(data?.message || 'Erreur lors de la suppression', 'error');
        }
    }
}

// Ouvrir la modale d'ajout
function openAddEmployeModal() {
    const modal = document.getElementById('addEmployeModal');
    if (modal) modal.style.display = 'flex';
}

// Fermer la modale d'ajout
function closeAddEmployeModal() {
    const modal = document.getElementById('addEmployeModal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('addEmployeForm');
    if (form) form.reset();
}

// Initialisation du formulaire d'ajout
document.addEventListener('DOMContentLoaded', () => {
    // Charger les employés
    loadEmployes();
    
    // Formulaire d'ajout d'employé
    const form = document.getElementById('addEmployeForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newEmploye = {
                nom: document.getElementById('newNom').value,
                prenom: document.getElementById('newPrenom').value,
                email: document.getElementById('newEmail').value,
                department: document.getElementById('newDepartment').value,
                role: document.getElementById('newRole').value,
                mot_de_passe: document.getElementById('newPassword').value
            };
            
            const data = await fetchAPI('/employes', {
                method: 'POST',
                body: JSON.stringify(newEmploye)
            });
            
            if (data?.success) {
                showToast('Employé créé avec succès', 'success');
                closeAddEmployeModal();
                loadEmployes();
            } else {
                showToast(data?.message || 'Erreur lors de la création', 'error');
            }
        });
    }
});
