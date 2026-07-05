import express from 'express';
import db from '../config/db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for image uploads
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Fetch Dashboard Statistics
router.get('/stats', async (req, res) => {
    try {
        const [revenue] = await db.execute('SELECT SUM(total_amount) as total FROM orders WHERE status = "completed"');
        const [orders] = await db.execute('SELECT COUNT(*) as count FROM orders');
        const [products] = await db.execute('SELECT COUNT(*) as count FROM products WHERE quantity < 5');
        
        res.json({
            revenue: revenue[0].total || 0,
            totalOrders: orders[0].count,
            lowStock: products[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload Product Image
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        
        const imageUrl = `/uploads/${req.file.filename}`;
        res.status(201).json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload Multiple Product Images (for views)
router.post('/upload-multiple-images', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No image files provided' });
        }
        
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.status(201).json({ 
            message: 'Images uploaded successfully',
            imageUrls: imageUrls,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add New Product
router.post('/add-product', async (req, res) => {
    const { name, cat, desc: product_desc, price, mrp, qty, material, is_featured, image, views } = req.body;
    try {
        // Validate all required fields
        if (!name || !cat || !product_desc || price === undefined || price === '' || mrp === undefined || mrp === '' || qty === undefined || qty === '' || !material) {
            return res.status(400).json({ 
                error: 'Missing or invalid required fields',
                required: ['name', 'cat', 'product_desc', 'price', 'mrp', 'qty', 'material']
            });
        }

        // Convert to proper types
        const convertedPrice = parseFloat(price);
        const convertedMrp = parseFloat(mrp);
        const convertedQty = parseInt(qty);

        if (isNaN(convertedPrice) || isNaN(convertedMrp) || isNaN(convertedQty)) {
            return res.status(400).json({ error: 'Price, MRP, and Quantity must be valid numbers' });
        }

        await db.execute(
            `INSERT INTO products (product_name, product_cat, product_desc, product_price, product_mrp, quantity, material, is_featured, image, views) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, cat, product_desc, convertedPrice, convertedMrp, convertedQty, material, is_featured ? 1 : 0, image || null, JSON.stringify(views || [])]
        );
        res.status(201).json({ message: "Product successfully added to BARA inventory" });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE a product
router.put('/products/:id', async (req, res) => {
    const { name, cat, desc: product_desc, price, mrp, qty, material, is_featured, image, views } = req.body;
    
    try {
        // Validate all required fields exist and are not empty
        if (!name || !cat || !product_desc || price === undefined || price === '' || mrp === undefined || mrp === '' || qty === undefined || qty === '' || !material) {
            return res.status(400).json({ 
                error: 'Missing or invalid required fields',
                received: { name, cat, product_desc, price, mrp, qty, material, is_featured, image, views }
            });
        }

        // Convert to proper types
        const convertedPrice = parseFloat(price);
        const convertedMrp = parseFloat(mrp);
        const convertedQty = parseInt(qty);

        if (isNaN(convertedPrice) || isNaN(convertedMrp) || isNaN(convertedQty)) {
            return res.status(400).json({ error: 'Price, MRP, and Quantity must be valid numbers' });
        }

        const result = await db.execute(
            `UPDATE products SET product_name = ?, product_cat = ?, product_desc = ?, product_price = ?, product_mrp = ?, quantity = ?, material = ?, is_featured = ?, image = ?, views = ? WHERE product_id = ?`,
            [name, cat, product_desc, convertedPrice, convertedMrp, convertedQty, material, is_featured ? 1 : 0, image, JSON.stringify(views || []), req.params.id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({ message: "Product successfully updated" });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE a product from inventory
router.delete('/products/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM products WHERE product_id = ?', [req.params.id]);
        res.json({ message: "Product removed from BARA collection" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all products for the admin table
router.get('/products', async (req, res) => {
    const { category } = req.query;
    try {
        let sql = 'SELECT * FROM products';
        const params = [];

        if (category) {
            sql += ' WHERE product_cat = ?';
            params.push(category);
        }

        sql += ' ORDER BY created_at DESC';

        const [products] = await db.execute(sql, params);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all categories with product counts
router.get('/categories', async (req, res) => {
    try {
        const [categories] = await db.execute(`
            SELECT 
                product_cat as name, 
                COUNT(product_id) as count 
            FROM products 
            GROUP BY product_cat
            ORDER BY name ASC
        `);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/sales-chart', async (req, res) => {
    try {
         const [rows] = await db.execute(`
            SELECT 
                DATE_FORMAT(created_at, '%d %b') as date, 
                IFNULL(SUM(total_amount), 0) as total 
            FROM orders 
            WHERE status = 'completed' AND created_at >= CURDATE() - INTERVAL 7 DAY 
            GROUP BY date 
            ORDER BY MIN(created_at) ASC
        `);
        
        // Ensure we always send an array
        res.json(Array.isArray(rows) ? rows : []); 
    } catch (error) {
        console.error("Chart SQL Error:", error);
        // Send a structured error message
        res.status(500).json({ error: "Failed to retrieve chart data", details: error.message }); 
    }
});

// GET pending orders count for notification
router.get('/orders/pending-count', async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT COUNT(*) as count FROM orders WHERE status IN ('pending', 'paid')");
        res.json({ count: rows[0].count || 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all orders with user info
router.get('/orders', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT o.order_id, o.total_amount, o.status, o.created_at, u.name, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.user_id 
            ORDER BY o.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update order status (e.g., from 'paid' to 'completed' or 'shipped')
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await db.execute('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
        res.json({ message: `Order status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all customers with their order history
router.get('/customers', async (req, res) => {
    try {
        const [customers] = await db.execute(`
            SELECT 
                u.user_id as id,
                u.name,
                u.email,
                u.phone,
                u.created_at as joinDate,
                COUNT(o.order_id) as totalOrders,
                IFNULL(SUM(o.total_amount), 0) as totalSpent
            FROM users u
            LEFT JOIN orders o ON u.user_id = o.user_id
            WHERE o.status = 'completed' OR o.status IS NULL
            GROUP BY u.user_id, u.name, u.email, u.phone, u.created_at
            ORDER BY u.created_at DESC
        `);
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a customer
router.delete('/customers/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM users WHERE user_id = ?', [req.params.id]);
        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all reviews
router.get('/reviews', async (req, res) => {
    try {
        const [reviews] = await db.execute(`
            SELECT 
                pr.review_id as id,
                p.product_name as productName,
                u.name as customerName,
                pr.rating,
                pr.comment,
                pr.approved,
                pr.created_at as date
            FROM product_reviews pr
            JOIN products p ON pr.product_id = p.product_id
            JOIN users u ON pr.user_id = u.user_id
            ORDER BY pr.created_at DESC
        `);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update review status (approve/reject)
router.put('/reviews/:id/status', async (req, res) => {
    const { approved } = req.body;
    try {
        await db.execute('UPDATE product_reviews SET approved = ? WHERE review_id = ?', [approved, req.params.id]);
        res.json({ message: `Review status updated` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a review
router.delete('/reviews/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM product_reviews WHERE review_id = ?', [req.params.id]);
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Coupons ---

// GET all coupons
router.get('/coupons', async (req, res) => {
    try {
        const [coupons] = await db.execute('SELECT *, coupon_id as id, code, discount_percent as discount, expiry_date as expiry, is_active as active FROM coupons ORDER BY created_at DESC');
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST add a new coupon
router.post('/coupons', async (req, res) => {
    const { code, discount, expiry, active } = req.body;
    try {
        await db.execute(
            'INSERT INTO coupons (code, discount_percent, expiry_date, is_active) VALUES (?, ?, ?, ?)',
            [code.toUpperCase(), discount, expiry, active]
        );
        res.status(201).json({ message: 'Coupon created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT toggle coupon status
router.put('/coupons/:id/status', async (req, res) => {
    const { active } = req.body;
    try {
        await db.execute('UPDATE coupons SET is_active = ? WHERE coupon_id = ?', [active, req.params.id]);
        res.json({ message: 'Coupon status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;