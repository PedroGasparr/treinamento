// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDEkkRm5s1QieOXz7rdxJEE_nTuOQAfm1Y",
    authDomain: "gzltreinamentos.firebaseapp.com",
    databaseURL: "https://gzltreinamentos-default-rtdb.firebaseio.com",
    projectId: "gzltreinamentos",
    storageBucket: "gzltreinamentos.appspot.com",
    messagingSenderId: "991106826698",
    appId: "1:991106826698:web:be17262818bdc0e04c4f33",
    measurementId: "G-CG2PSQQ35G"
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// Dados dos treinamentos
const trainingsData = {
    "treinamento1": {
        title: "Segurança no Trabalho",
        description: "Treinamento completo sobre normas de segurança"
    },
    "treinamento2": {
        title: "Primeiros Socorros",
        description: "Aprenda procedimentos básicos de primeiros socorros"
    },
    "treinamento3": {
        title: "Prevenção de Acidentes",
        description: "Como prevenir acidentes no ambiente de trabalho"
    }
};

// Variável para armazenar o funcionário selecionado
let selectedEmployee = null;

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
});

// Inicializa a autenticação
function initializeAuth() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            document.getElementById('userName').textContent = user.displayName || user.email.split('@')[0];
            loadEmployees();
        } else {
            window.location.href = 'index.html';
        }
    });
}

// Configura todos os event listeners
function setupEventListeners() {
    // Filtros
    document.getElementById('searchBtn').addEventListener('click', applyFilters);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') applyFilters();
    });
    
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('trainingFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('unitFilter').addEventListener('change', applyFilters);
    
    // Botão de exportação
    document.getElementById('exportBtn').addEventListener('click', exportToExcel);
    
    // Botão de atribuir treinamento
    document.getElementById('assignTrainingBtn').addEventListener('click', openAssignTrainingModal);
    
    // Botão de salvar treinamento
    document.getElementById('saveTrainingBtn').addEventListener('click', saveTrainingAssignment);
    
    // Botão de salvar edição de funcionário
    document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployeeChanges);
    
    // Fechar modais
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('employeeModal').style.display = 'none';
    });
    
    document.querySelector('.close-assign-modal').addEventListener('click', () => {
        document.getElementById('assignTrainingModal').style.display = 'none';
    });
    
    document.querySelector('.close-edit-modal').addEventListener('click', () => {
        document.getElementById('editEmployeeModal').style.display = 'none';
    });
    
    // Navegação do menu - Atualizado com prevenção de comportamento padrão
    document.getElementById('menuHome').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'home.html';
    });
    
    document.getElementById('menuTrainings').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'trinametoadm.html';
    });
    
    document.getElementById('menuEmployees').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'admin.html';
    });
    
    document.getElementById('menuProfile').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'perfiladm.html';
    });
    
    document.getElementById('menuLogout').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Erro ao fazer logout:", error);
        });
    });
}

// Carrega a lista de funcionários
function loadEmployees() {
    const employeesRef = database.ref('users');
    
    employeesRef.once('value').then((snapshot) => {
        const employees = [];
        snapshot.forEach((childSnapshot) => {
            const user = childSnapshot.val();
            employees.push({
                id: childSnapshot.key,
                name: user.name || user.email.split('@')[0],
                email: user.email,
                isAdmin: user.isAdmin || false,
                unit: user.unit || ''
            });
        });
        
        renderEmployeesTable(employees);
    }).catch((error) => {
        console.error("Erro ao carregar funcionários:", error);
        showAlert("Erro ao carregar lista de funcionários.");
    });
}

// Renderiza a tabela de funcionários
function renderEmployeesTable(employees) {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    employees.forEach(employee => {
        loadEmployeeTrainingsForTable(employee);
    });
}

// Carrega os treinamentos para uma linha da tabela
function loadEmployeeTrainingsForTable(employee) {
    const trainingsRef = database.ref(`userTrainings/${employee.id}`);
    
    trainingsRef.once('value').then((trainingsSnapshot) => {
        const trainings = trainingsSnapshot.val() || {};
        const trainingList = processTrainingsData(trainings);
        createEmployeeRow(employee, trainingList);
    }).catch(error => {
        console.error(`Erro ao carregar treinamentos do funcionário ${employee.id}:`, error);
        createEmployeeRow(employee, []);
    });
}

// Processa os dados dos treinamentos
function processTrainingsData(trainings) {
    return Object.keys(trainings).map(trainingId => {
        return {
            id: trainingId,
            ...trainings[trainingId],
            ...trainingsData[trainingId]
        };
    }).sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
        const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
        return dateB - dateA;
    });
}

// Cria uma linha na tabela para o funcionário
function createEmployeeRow(employee, trainingList) {
    const tableBody = document.getElementById('employeesTableBody');
    if (!tableBody) return;

    const row = document.createElement('tr');
    row.setAttribute('data-unit', employee.unit || '');
    
    row.innerHTML = `
        <td>${employee.name}</td>
        <td>${employee.email}</td>
        <td id="trainingsCell-${employee.id}"></td>
        <td id="lastUpdateCell-${employee.id}"></td>
        <td class="actions">
            <button class="view-btn" data-id="${employee.id}"><i class="material-icons">visibility</i></button>
            <button class="edit-btn" data-id="${employee.id}"><i class="material-icons">edit</i></button>
        </td>
    `;
    
    tableBody.appendChild(row);
    renderEmployeeTrainingsSummary(employee.id, trainingList);
    setupRowEventListeners(row, employee.id);
}

// Renderiza o resumo dos treinamentos na tabela
function renderEmployeeTrainingsSummary(employeeId, trainings) {
    const trainingsCell = document.getElementById(`trainingsCell-${employeeId}`);
    const lastUpdateCell = document.getElementById(`lastUpdateCell-${employeeId}`);
    
    if (!trainingsCell || !lastUpdateCell) return;

    if (trainings.length === 0) {
        trainingsCell.innerHTML = '<span class="status-not-started">Nenhum treinamento</span>';
        lastUpdateCell.textContent = '-';
        return;
    }
    
    const statusCounts = countTrainingStatuses(trainings);
    trainingsCell.innerHTML = `
        <span class="status-completed">${statusCounts.completed} concluído(s)</span><br>
        <span class="status-in-progress">${statusCounts.inProgress} em andamento</span><br>
        <span class="status-not-started">${statusCounts.notStarted} não iniciados</span>
    `;
    
    lastUpdateCell.textContent = getLastUpdateDate(trainings);
}

// Conta os status dos treinamentos
function countTrainingStatuses(trainings) {
    return trainings.reduce((counts, training) => {
        if (training.quizCompleted) counts.completed++;
        else if (training.startedAt) counts.inProgress++;
        else counts.notStarted++;
        return counts;
    }, { completed: 0, inProgress: 0, notStarted: 0 });
}

// Obtém a data da última atualização
function getLastUpdateDate(trainings) {
    const lastUpdate = trainings.reduce((latest, training) => {
        const date = training.completedAt || training.startedAt;
        if (!date) return latest;
        const dateObj = new Date(date);
        return (!latest || dateObj > latest) ? dateObj : latest;
    }, null);
    
    return lastUpdate ? formatDate(lastUpdate) : '-';
}

// Configura os event listeners para uma linha específica
function setupRowEventListeners(row, employeeId) {
    // Botão de visualização
    row.querySelector('.view-btn').addEventListener('click', () => {
        showEmployeeDetails(employeeId);
    });
    
    // Botão de edição
    row.querySelector('.edit-btn').addEventListener('click', () => {
        editEmployee(employeeId);
    });
}

// Mostra os detalhes do funcionário em um modal
function showEmployeeDetails(employeeId) {
    const modal = document.getElementById('employeeModal');
    const modalName = document.getElementById('modalEmployeeName');
    const modalEmail = document.getElementById('modalEmployeeEmail');
    const modalTrainings = document.getElementById('modalTrainingsList');
    
    if (!modal || !modalName || !modalEmail || !modalTrainings) return;

    // Busca os dados do funcionário
    database.ref(`users/${employeeId}`).once('value').then((userSnapshot) => {
        const user = userSnapshot.val();
        selectedEmployee = {
            id: employeeId,
            name: user.name || user.email.split('@')[0],
            email: user.email,
            unit: user.unit || '',
            isAdmin: user.isAdmin || false
        };
        
        modalName.textContent = selectedEmployee.name;
        modalEmail.textContent = selectedEmployee.email;
        
        // Busca os treinamentos do funcionário
        return database.ref(`userTrainings/${employeeId}`).once('value');
    }).then((trainingsSnapshot) => {
        const trainings = trainingsSnapshot.val() || {};
        modalTrainings.innerHTML = '';
        
        if (Object.keys(trainings).length === 0) {
            modalTrainings.innerHTML = '<p>Nenhum treinamento registrado.</p>';
            return;
        }
        
        renderModalTrainings(trainings);
        modal.style.display = 'block';
    }).catch((error) => {
        console.error("Erro ao carregar detalhes do funcionário:", error);
        showAlert("Erro ao carregar detalhes do funcionário.");
    });
}

// Renderiza os treinamentos no modal
function renderModalTrainings(trainings) {
    const modalTrainings = document.getElementById('modalTrainingsList');
    if (!modalTrainings) return;

    const sortedTrainings = Object.entries(trainings).sort((a, b) => {
        const dateA = a[1].completedAt || a[1].startedAt || '0';
        const dateB = b[1].completedAt || b[1].startedAt || '0';
        return new Date(dateB) - new Date(dateA);
    });
    
    sortedTrainings.forEach(([trainingId, trainingData]) => {
        const trainingInfo = trainingsData[trainingId] || { 
            title: trainingId, 
            description: 'Treinamento não encontrado' 
        };
        
        const trainingDiv = document.createElement('div');
        trainingDiv.className = 'training-details';
        trainingDiv.innerHTML = `
            <h4>${trainingInfo.title}</h4>
            <span><strong>Status:</strong> ${getStatusText(trainingData)}</span>
            ${trainingData.startedAt ? `<span><strong>Iniciado em:</strong> ${formatDate(trainingData.startedAt)}</span>` : ''}
            ${trainingData.completedAt ? `<span><strong>Concluído em:</strong> ${formatDate(trainingData.completedAt)}</span>` : ''}
            ${trainingData.score ? `<span><strong>Pontuação:</strong> ${trainingData.score}</span>` : ''}
            <hr>
        `;
        
        modalTrainings.appendChild(trainingDiv);
    });
}

// Abre o modal para atribuir treinamento
function openAssignTrainingModal() {
    if (!selectedEmployee) return;

    const assignModal = document.getElementById('assignTrainingModal');
    const assignEmployeeName = document.getElementById('assignEmployeeName');
    const assignEmployeeEmail = document.getElementById('assignEmployeeEmail');
    const trainingSelect = document.getElementById('trainingSelect');
    
    if (!assignModal || !assignEmployeeName || !assignEmployeeEmail || !trainingSelect) return;

    // Preenche os dados do funcionário
    assignEmployeeName.textContent = selectedEmployee.name;
    assignEmployeeEmail.textContent = selectedEmployee.email;
    
    // Limpa e preenche o select de treinamentos
    trainingSelect.innerHTML = '';
    for (const [id, training] of Object.entries(trainingsData)) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = training.title;
        trainingSelect.appendChild(option);
    }
    
    // Mostra o modal
    assignModal.style.display = 'block';
}

// Salva a atribuição de treinamento
function saveTrainingAssignment() {
    const trainingSelect = document.getElementById('trainingSelect');
    if (!trainingSelect || !selectedEmployee) return;

    const selectedTraining = trainingSelect.value;
    if (!selectedTraining) return;
    
    const trainingData = {
        [selectedTraining]: {
            assignedAt: new Date().toISOString(),
            status: "assigned",
            startedAt: null,
            completedAt: null,
            quizCompleted: false
        }
    };
    
    database.ref(`userTrainings/${selectedEmployee.id}`).update(trainingData)
        .then(() => {
            showAlert("Treinamento atribuído com sucesso!");
            document.getElementById('assignTrainingModal').style.display = 'none';
            loadEmployeeTrainingsForTable(selectedEmployee);
        })
        .catch(error => {
            console.error("Erro ao atribuir treinamento:", error);
            showAlert("Erro ao atribuir treinamento.");
        });
}

// Edita um funcionário
function editEmployee(employeeId) {
    const editModal = document.getElementById('editEmployeeModal');
    const editId = document.getElementById('editEmployeeId');
    const editName = document.getElementById('editEmployeeName');
    const editEmail = document.getElementById('editEmployeeEmail');
    const editUnit = document.getElementById('editEmployeeUnit');
    const editIsAdmin = document.getElementById('editEmployeeIsAdmin');
    
    if (!editModal || !editId || !editName || !editEmail || !editUnit || !editIsAdmin) return;

    database.ref(`users/${employeeId}`).once('value').then((userSnapshot) => {
        const user = userSnapshot.val();
        
        editId.value = employeeId;
        editName.value = user.name || '';
        editEmail.textContent = user.email;
        editUnit.value = user.unit || '';
        editIsAdmin.checked = user.isAdmin || false;
        
        editModal.style.display = 'block';
    }).catch((error) => {
        console.error("Erro ao carregar dados do funcionário:", error);
        showAlert("Erro ao carregar dados do funcionário para edição.");
    });
}

// Salva as alterações do funcionário editado
function saveEmployeeChanges() {
    const editId = document.getElementById('editEmployeeId');
    const editName = document.getElementById('editEmployeeName');
    const editUnit = document.getElementById('editEmployeeUnit');
    const editIsAdmin = document.getElementById('editEmployeeIsAdmin');
    
    if (!editId || !editName || !editUnit || !editIsAdmin) return;

    const employeeId = editId.value;
    const name = editName.value;
    const unit = editUnit.value;
    const isAdmin = editIsAdmin.checked;
    
    database.ref(`users/${employeeId}`).update({
        name: name,
        unit: unit,
        isAdmin: isAdmin
    }).then(() => {
        showAlert("Alterações salvas com sucesso!");
        document.getElementById('editEmployeeModal').style.display = 'none';
        loadEmployees();
    }).catch((error) => {
        console.error("Erro ao salvar alterações:", error);
        showAlert("Erro ao salvar alterações.");
    });
}

// Aplica os filtros na tabela
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const trainingFilter = document.getElementById('trainingFilter');
    const dateFilter = document.getElementById('dateFilter');
    const unitFilter = document.getElementById('unitFilter');
    
    if (!searchInput || !statusFilter || !trainingFilter || !dateFilter || !unitFilter) return;

    const searchText = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;
    const trainingValue = trainingFilter.value;
    const dateValue = dateFilter.value;
    const unitValue = unitFilter.value;
    
    const rows = document.querySelectorAll('#employeesTableBody tr');
    
    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const email = row.cells[1].textContent.toLowerCase();
        const trainingsCell = row.cells[2];
        const lastUpdate = row.cells[3].textContent;
        const unit = row.getAttribute('data-unit') || '';
        
        // Filtro de texto
        const textMatch = name.includes(searchText) || email.includes(searchText);
        
        // Filtro de status
        let statusMatch = true;
        if (statusValue !== 'all') {
            const statusText = trainingsCell.textContent;
            statusMatch = statusText.includes(
                statusValue === 'completed' ? 'concluído' : 
                statusValue === 'in_progress' ? 'andamento' : 'iniciados'
            );
        }
        
        // Filtro de data
        let dateMatch = true;
        if (dateValue !== 'all' && lastUpdate !== '-') {
            const date = new Date(lastUpdate.split(' ')[0].split('/').reverse().join('-'));
            const now = new Date();
            const diffDays = (now - date) / (1000 * 60 * 60 * 24);
            
            if (dateValue === 'last_month' && diffDays > 30) dateMatch = false;
            else if (dateValue === 'last_3_months' && diffDays > 90) dateMatch = false;
            else if (dateValue === 'last_year' && diffDays > 365) dateMatch = false;
        }
        
        // Filtro de unidade
        let unitMatch = true;
        if (unitValue !== 'all') {
            unitMatch = unit === unitValue;
        }
        
        // Mostra/oculta a linha com base nos filtros
        row.style.display = (textMatch && statusMatch && dateMatch && unitMatch) ? '' : 'none';
    });
}

// Exporta os dados para Excel
function exportToExcel() {
    const rows = document.querySelectorAll('#employeesTableBody tr:not([style*="display: none"])');
    const data = [['Nome', 'Email', 'Treinamentos Concluídos', 'Treinamentos em Andamento', 'Última Atualização']];
    
    rows.forEach(row => {
        const name = row.cells[0].textContent;
        const email = row.cells[1].textContent;
        const trainingsText = row.cells[2].textContent;
        
        // Extrai os números dos status
        const completedMatch = trainingsText.match(/concluído\(s\)\)?(\d+)/);
        const inProgressMatch = trainingsText.match(/andamento\)?(\d+)/);
        
        const completed = completedMatch ? completedMatch[1] : '0';
        const inProgress = inProgressMatch ? inProgressMatch[1] : '0';
        const lastUpdate = row.cells[3].textContent;
        
        data.push([name, email, completed, inProgress, lastUpdate]);
    });
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Funcionários");
    XLSX.writeFile(wb, "relatorio_treinamentos_funcionarios.xlsx");
}

// Retorna o texto do status do treinamento
function getStatusText(trainingData) {
    if (trainingData.quizCompleted) {
        return '<span class="status-completed">Concluído</span>';
    } else if (trainingData.startedAt) {
        return '<span class="status-in-progress">Em andamento</span>';
    }
    return '<span class="status-not-started">Não iniciado</span>';
}

// Formata data para exibição
function formatDate(dateString) {
    if (!dateString) return '';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
}

// Mostra um alerta
function showAlert(message) {
    alert(message);
}