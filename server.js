const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rkm9636',  // Change this to your MySQL password
    database: 'pharmacy_management'
});

// Connect to Database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to MySQL Database');
});

// ==================== MEDICINES ROUTES ====================

// Get all medicines
app.get('/api/medicines', (req, res) => {
    const sql = 'SELECT * FROM medicines ORDER BY name';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Get single medicine
app.get('/api/medicines/:id', (req, res) => {
    const sql = 'SELECT * FROM medicines WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.json(results[0]);
    });
});

// Add new medicine
app.post('/api/medicines', (req, res) => {
    const { name, category, quantity, price, expiry, supplier } = req.body;
    
    if (!name || !category || !quantity || !price || !expiry || !supplier) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO medicines (name, category, quantity, price, expiry, supplier) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [name, category, quantity, price, expiry, supplier], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
            message: 'Medicine added successfully', 
            id: result.insertId 
        });
    });
});

// Update medicine
app.put('/api/medicines/:id', (req, res) => {
    const { name, category, quantity, price, expiry, supplier } = req.body;
    const sql = 'UPDATE medicines SET name = ?, category = ?, quantity = ?, price = ?, expiry = ?, supplier = ? WHERE id = ?';
    
    db.query(sql, [name, category, quantity, price, expiry, supplier, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.json({ message: 'Medicine updated successfully' });
    });
});

// Delete medicine
app.delete('/api/medicines/:id', (req, res) => {
    const sql = 'DELETE FROM medicines WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.json({ message: 'Medicine deleted successfully' });
    });
});

// ==================== CUSTOMERS ROUTES ====================

// Get all customers
app.get('/api/customers', (req, res) => {
    const sql = 'SELECT * FROM customers ORDER BY name';
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Get single customer
app.get('/api/customers/:id', (req, res) => {
    const sql = 'SELECT * FROM customers WHERE id = ?';
    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(results[0]);
    });
});

// Add new customer
app.post('/api/customers', (req, res) => {
    const { name, phone, email } = req.body;
    
    if (!name || !phone || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const sql = 'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)';
    db.query(sql, [name, phone, email], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
            message: 'Customer added successfully', 
            id: result.insertId 
        });
    });
});

// Update customer
app.put('/api/customers/:id', (req, res) => {
    const { name, phone, email } = req.body;
    const sql = 'UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?';
    
    db.query(sql, [name, phone, email, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer updated successfully' });
    });
});

// Delete customer
app.delete('/api/customers/:id', (req, res) => {
    const sql = 'DELETE FROM customers WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    });
});

// ==================== SALES ROUTES ====================

// Get all sales with customer and medicine names
app.get('/api/sales', (req, res) => {
    const sql = `
        SELECT 
            s.id, 
            s.quantity, 
            s.total, 
            s.sale_date,
            c.name as customer_name,
            m.name as medicine_name
        FROM sales s
        JOIN customers c ON s.customer_id = c.id
        JOIN medicines m ON s.medicine_id = m.id
        ORDER BY s.sale_date DESC, s.id DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Add new sale
app.post('/api/sales', (req, res) => {
    const { customer_id, medicine_id, quantity, total, sale_date } = req.body;
    
    if (!customer_id || !medicine_id || !quantity || !total) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // First check if medicine has enough stock
    const checkStockSql = 'SELECT quantity FROM medicines WHERE id = ?';
    db.query(checkStockSql, [medicine_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        const availableStock = results[0].quantity;
        if (availableStock < quantity) {
            return res.status(400).json({ 
                error: 'Insufficient stock', 
                message: `Only ${availableStock} units available` 
            });
        }

        // Add sale
        const insertSaleSql = 'INSERT INTO sales (customer_id, medicine_id, quantity, total, sale_date) VALUES (?, ?, ?, ?, ?)';
        db.query(insertSaleSql, [customer_id, medicine_id, quantity, total, sale_date], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Update medicine quantity
            const updateStockSql = 'UPDATE medicines SET quantity = quantity - ? WHERE id = ?';
            db.query(updateStockSql, [quantity, medicine_id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error updating stock' });
                }
                
                res.status(201).json({ 
                    message: 'Sale completed successfully', 
                    id: result.insertId 
                });
            });
        });
    });
});

// Delete sale (and restore stock)
app.delete('/api/sales/:id', (req, res) => {
    // First get sale details
    const getSaleSql = 'SELECT medicine_id, quantity FROM sales WHERE id = ?';
    db.query(getSaleSql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Sale not found' });
        }

        const { medicine_id, quantity } = results[0];

        // Delete sale
        const deleteSql = 'DELETE FROM sales WHERE id = ?';
        db.query(deleteSql, [req.params.id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }

            // Restore stock
            const updateStockSql = 'UPDATE medicines SET quantity = quantity + ? WHERE id = ?';
            db.query(updateStockSql, [quantity, medicine_id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error restoring stock' });
                }
                
                res.json({ message: 'Sale deleted successfully' });
            });
        });
    });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API endpoints available at http://localhost:3000/api');
});