// API Base URL
const API_URL = 'http://localhost:3000/api';

// Global Variables
let currentEditId = null;
let currentEditType = null;

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    updateDate();
    setupEventListeners();
    loadDashboard();
    loadMedicines();
    loadCustomers();
    loadSales();
});

// Update Current Date
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // Add Buttons
    document.getElementById('addMedicineBtn').addEventListener('click', () => openMedicineModal());
    document.getElementById('addCustomerBtn').addEventListener('click', () => openCustomerModal());
    document.getElementById('addSaleBtn').addEventListener('click', () => openSaleModal());

    // Search Functionality
    document.getElementById('medicineSearch').addEventListener('input', filterMedicines);
    document.getElementById('customerSearch').addEventListener('input', filterCustomers);

    // Sale Quantity Change
    document.getElementById('saleQuantity').addEventListener('input', calculateSaleTotal);
    document.getElementById('saleMedicine').addEventListener('change', calculateSaleTotal);
}

// Switch Tab
function switchTab(tabName) {
    // Update Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update Content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Reload data if needed
    if (tabName === 'dashboard') loadDashboard();
}

// ==================== DASHBOARD ====================

async function loadDashboard() {
    try {
        const [medicines, sales] = await Promise.all([
            fetch(`${API_URL}/medicines`).then(r => r.json()),
            fetch(`${API_URL}/sales`).then(r => r.json())
        ]);

        // Calculate Stats
        const totalMedicines = medicines.length;
        const lowStockItems = medicines.filter(m => m.quantity < 50).length;
        const totalRevenue = sales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
        const expiringItems = medicines.filter(m => new Date(m.expiry) <= threeMonthsFromNow).length;

        // Update Stats
        document.getElementById('totalMedicines').textContent = totalMedicines;
        document.getElementById('lowStockItems').textContent = lowStockItems;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('expiringItems').textContent = expiringItems;

        // Low Stock Alert
        const lowStockAlert = document.getElementById('lowStockAlert');
        const lowStock = medicines.filter(m => m.quantity < 50);
        
        if (lowStock.length === 0) {
            lowStockAlert.innerHTML = '<p style="text-align: center; color: #888; padding: 20px;">No low stock items</p>';
        } else {
            lowStockAlert.innerHTML = lowStock.map(med => `
                <div class="alert-item warning">
                    <span style="font-weight: 500;">${med.name}</span>
                    <span style="color: #f57c00;">Stock: ${med.quantity}</span>
                </div>
            `).join('');
        }

        // Recent Sales
        const recentSales = document.getElementById('recentSales');
        const recentSalesData = sales.slice(0, 5);
        
        recentSales.innerHTML = recentSalesData.map(sale => `
            <div class="alert-item success">
                <div>
                    <p style="font-weight: 500;">${sale.medicine_name}</p>
                    <p style="font-size: 14px; color: #666;">${sale.customer_name}</p>
                </div>
                <span style="color: #388e3c; font-weight: 600;">$${parseFloat(sale.total).toFixed(2)}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showAlert('Error loading dashboard data');
    }
}

// ==================== MEDICINES ====================

async function loadMedicines() {
    try {
        const response = await fetch(`${API_URL}/medicines`);
        const medicines = await response.json();
        displayMedicines(medicines);
    } catch (error) {
        console.error('Error loading medicines:', error);
        showAlert('Error loading medicines');
    }
}

function displayMedicines(medicines) {
    const tbody = document.getElementById('medicineTableBody');
    
    if (medicines.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">No medicines found</td></tr>';
        return;
    }

    tbody.innerHTML = medicines.map(med => `
        <tr>
            <td style="font-weight: 500;">${med.name}</td>
            <td>${med.category}</td>
            <td>
                <span class="stock-badge ${med.quantity < 50 ? 'low' : 'good'}">
                    ${med.quantity}
                </span>
            </td>
            <td>$${parseFloat(med.price).toFixed(2)}</td>
            <td>${new Date(med.expiry).toLocaleDateString()}</td>
            <td>${med.supplier}</td>
            <td>
                <button class="btn-edit" onclick="editMedicine(${med.id})">✏️ Edit</button>
                <button class="btn-delete" onclick="deleteMedicine(${med.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

function filterMedicines() {
    const searchTerm = document.getElementById('medicineSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#medicineTableBody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function openMedicineModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('medicineModal');
    const title = document.getElementById('medicineModalTitle');
    
    if (id) {
        title.textContent = 'Edit Medicine';
        loadMedicineData(id);
    } else {
        title.textContent = 'Add New Medicine';
        clearMedicineForm();
    }
    
    modal.classList.add('active');
}

function closeMedicineModal() {
    document.getElementById('medicineModal').classList.remove('active');
    clearMedicineForm();
    currentEditId = null;
}

function clearMedicineForm() {
    document.getElementById('medicineName').value = '';
    document.getElementById('medicineCategory').value = '';
    document.getElementById('medicineQuantity').value = '';
    document.getElementById('medicinePrice').value = '';
    document.getElementById('medicineExpiry').value = '';
    document.getElementById('medicineSupplier').value = '';
}

async function loadMedicineData(id) {
    try {
        const response = await fetch(`${API_URL}/medicines/${id}`);
        const medicine = await response.json();
        
        document.getElementById('medicineName').value = medicine.name;
        document.getElementById('medicineCategory').value = medicine.category;
        document.getElementById('medicineQuantity').value = medicine.quantity;
        document.getElementById('medicinePrice').value = medicine.price;
        document.getElementById('medicineExpiry').value = medicine.expiry.split('T')[0];
        document.getElementById('medicineSupplier').value = medicine.supplier;
    } catch (error) {
        console.error('Error loading medicine:', error);
        showAlert('Error loading medicine data');
    }
}

async function saveMedicine() {
    const data = {
        name: document.getElementById('medicineName').value,
        category: document.getElementById('medicineCategory').value,
        quantity: parseInt(document.getElementById('medicineQuantity').value),
        price: parseFloat(document.getElementById('medicinePrice').value),
        expiry: document.getElementById('medicineExpiry').value,
        supplier: document.getElementById('medicineSupplier').value
    };

    if (!data.name || !data.category || !data.quantity || !data.price || !data.expiry || !data.supplier) {
        showAlert('Please fill all fields');
        return;
    }

    try {
        const url = currentEditId ? `${API_URL}/medicines/${currentEditId}` : `${API_URL}/medicines`;
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert(currentEditId ? 'Medicine updated successfully' : 'Medicine added successfully', 'success');
            closeMedicineModal();
            loadMedicines();
            loadDashboard();
        }
    } catch (error) {
        console.error('Error saving medicine:', error);
        showAlert('Error saving medicine');
    }
}

async function editMedicine(id) {
    openMedicineModal(id);
}

async function deleteMedicine(id) {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
        const response = await fetch(`${API_URL}/medicines/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Medicine deleted successfully', 'success');
            loadMedicines();
            loadDashboard();
        }
    } catch (error) {
        console.error('Error deleting medicine:', error);
        showAlert('Error deleting medicine');
    }
}

// ==================== CUSTOMERS ====================

async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`);
        const customers = await response.json();
        displayCustomers(customers);
    } catch (error) {
        console.error('Error loading customers:', error);
        showAlert('Error loading customers');
    }
}

function displayCustomers(customers) {
    const container = document.getElementById('customerCards');
    
    if (customers.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 30px;">No customers found</p>';
        return;
    }

    container.innerHTML = customers.map(customer => `
        <div class="customer-card">
            <div class="card-header">
                <div class="card-icon">👤</div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="editCustomer(${customer.id})">✏️</button>
                    <button class="btn-delete" onclick="deleteCustomer(${customer.id})">🗑️</button>
                </div>
            </div>
            <h3 class="customer-name">${customer.name}</h3>
            <p class="customer-info">📞 ${customer.phone}</p>
            <p class="customer-info">✉️ ${customer.email}</p>
        </div>
    `).join('');
}

function filterCustomers() {
    const searchTerm = document.getElementById('customerSearch').value.toLowerCase();
    const cards = document.querySelectorAll('.customer-card');
    
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function openCustomerModal(id = null) {
    currentEditId = id;
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');
    
    if (id) {
        title.textContent = 'Edit Customer';
        loadCustomerData(id);
    } else {
        title.textContent = 'Add New Customer';
        clearCustomerForm();
    }
    
    modal.classList.add('active');
}

function closeCustomerModal() {
    document.getElementById('customerModal').classList.remove('active');
    clearCustomerForm();
    currentEditId = null;
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
}

async function loadCustomerData(id) {
    try {
        const response = await fetch(`${API_URL}/customers/${id}`);
        const customer = await response.json();
        
        document.getElementById('customerName').value = customer.name;
        document.getElementById('customerPhone').value = customer.phone;
        document.getElementById('customerEmail').value = customer.email;
    } catch (error) {
        console.error('Error loading customer:', error);
        showAlert('Error loading customer data');
    }
}

async function saveCustomer() {
    const data = {
        name: document.getElementById('customerName').value,
        phone: document.getElementById('customerPhone').value,
        email: document.getElementById('customerEmail').value
    };

    if (!data.name || !data.phone || !data.email) {
        showAlert('Please fill all fields');
        return;
    }

    try {
        const url = currentEditId ? `${API_URL}/customers/${currentEditId}` : `${API_URL}/customers`;
        const method = currentEditId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert(currentEditId ? 'Customer updated successfully' : 'Customer added successfully', 'success');
            closeCustomerModal();
            loadCustomers();
        }
    } catch (error) {
        console.error('Error saving customer:', error);
        showAlert('Error saving customer');
    }
}

async function editCustomer(id) {
    openCustomerModal(id);
}

async function deleteCustomer(id) {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    
    try {
        const response = await fetch(`${API_URL}/customers/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Customer deleted successfully', 'success');
            loadCustomers();
        }
    } catch (error) {
        console.error('Error deleting customer:', error);
        showAlert('Error deleting customer');
    }
}

// ==================== SALES ====================

async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/sales`);
        const sales = await response.json();
        displaySales(sales);
    } catch (error) {
        console.error('Error loading sales:', error);
        showAlert('Error loading sales');
    }
}

function displaySales(sales) {
    const tbody = document.getElementById('salesTableBody');
    
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">No sales found</td></tr>';
        return;
    }

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${new Date(sale.sale_date).toLocaleDateString()}</td>
            <td style="font-weight: 500;">${sale.customer_name}</td>
            <td>${sale.medicine_name}</td>
            <td>${sale.quantity}</td>
            <td style="color: #388e3c; font-weight: 600;">$${parseFloat(sale.total).toFixed(2)}</td>
            <td>
                <button class="btn-delete" onclick="deleteSale(${sale.id})">🗑️ Delete</button>
            </td>
        </tr>
    `).join('');
}

async function openSaleModal() {
    const modal = document.getElementById('saleModal');
    
    // Load customers and medicines for dropdowns
    try {
        const [customers, medicines] = await Promise.all([
            fetch(`${API_URL}/customers`).then(r => r.json()),
            fetch(`${API_URL}/medicines`).then(r => r.json())
        ]);

        const customerSelect = document.getElementById('saleCustomer');
        customerSelect.innerHTML = '<option value="">Select Customer</option>' + 
            customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

        const medicineSelect = document.getElementById('saleMedicine');
        medicineSelect.innerHTML = '<option value="">Select Medicine</option>' + 
            medicines.map(m => `<option value="${m.id}" data-price="${m.price}">${m.name} - $${m.price}</option>`).join('');

        document.getElementById('saleQuantity').value = '1';
        document.getElementById('saleTotal').value = '';
        
        modal.classList.add('active');
    } catch (error) {
        console.error('Error loading sale data:', error);
        showAlert('Error loading sale data');
    }
}

function closeSaleModal() {
    document.getElementById('saleModal').classList.remove('active');
}

function calculateSaleTotal() {
    const medicineSelect = document.getElementById('saleMedicine');
    const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
    
    if (medicineSelect.selectedIndex > 0) {
        const price = parseFloat(medicineSelect.options[medicineSelect.selectedIndex].dataset.price);
        const total = price * quantity;
        document.getElementById('saleTotal').value = total.toFixed(2);
    }
}

async function saveSale() {
    const data = {
        customer_id: parseInt(document.getElementById('saleCustomer').value),
        medicine_id: parseInt(document.getElementById('saleMedicine').value),
        quantity: parseInt(document.getElementById('saleQuantity').value),
        total: parseFloat(document.getElementById('saleTotal').value),
        sale_date: new Date().toISOString().split('T')[0]
    };

    if (!data.customer_id || !data.medicine_id || !data.quantity || !data.total) {
        showAlert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/sales`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showAlert('Sale completed successfully', 'success');
            closeSaleModal();
            loadSales();
            loadMedicines();
            loadDashboard();
        } else {
            const error = await response.json();
            showAlert(error.message || 'Error completing sale');
        }
    } catch (error) {
        console.error('Error saving sale:', error);
        showAlert('Error saving sale');
    }
}

async function deleteSale(id) {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    try {
        const response = await fetch(`${API_URL}/sales/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showAlert('Sale deleted successfully', 'success');
            loadSales();
            loadDashboard();
        }
    } catch (error) {
        console.error('Error deleting sale:', error);
        showAlert('Error deleting sale');
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#F44336'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s;
    `;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);