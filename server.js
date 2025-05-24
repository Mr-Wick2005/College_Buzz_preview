require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const multer = require("multer");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'pages')));

app.use(cors());

// Connect to MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "veda",
    database: "college_buzz",
});

db.connect(err => {
    if (err) {
        console.error("❌ Database connection failed:", err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

const postersFolder = 'get-posters';

// Serve static files
app.use('/get-posters', express.static(path.join(__dirname, postersFolder)));

// Multer config for poster uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, postersFolder + '/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});
const upload = multer({ storage });


// 👉 student Login
app.post('/submit-student-login', (req, res) => {
    const { email, phone } = req.body;

    if (!email || !phone) {
        return res.status(400).json({ success: false, message: 'Email and phone are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate phone number (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ success: false, message: 'Phone number must be 10 digits' });
    }

    const sql = 'INSERT INTO students (email, phone) VALUES (?, ?)';
    db.query(sql, [email, phone], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        console.log('Student login data inserted:', result);
        // ✅ Respond with JSON instead of redirect
        res.json({ success: true });
    });
});
  
  

// 👉 College Registration
app.post("/register", async (req, res) => {
    const { college_name, college_email, phone_number, admin_email, create_password } = req.body;

    if (!college_name || !college_email || !phone_number || !admin_email || !create_password) {
        return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(create_password, 10);
        const sql = "INSERT INTO colleges (college_name, college_email, phone_number, admin_email, password_hash) VALUES (?, ?, ?, ?, ?)";
        db.query(sql, [college_name, college_email, phone_number, admin_email, hashedPassword], (err, result) => {
            if (err) {
                console.error("❌ Insert error:", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, message: "🎉 Registration successful!" });
        });
    } catch (error) {
        console.error("❌ Error hashing password:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// 👉 Admin Login
app.post("/admin-login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const sql = "SELECT * FROM colleges WHERE admin_email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("❌ Query error:", err);
            return res.status(500).json({ success: false, message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Invalid email or password." });
        }

        const admin = results[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);

        if (isMatch) {
            res.json({ success: true, message: "✅ Login successful!", college_id: admin.id });
        } else {
            res.status(401).json({ success: false, message: "Invalid email or password." });
        }
    });
});

// 👉 Poster Upload
app.post("/upload-poster", upload.single('poster'), (req, res) => {
    console.log("Received upload-poster request");

    const { title, category, description } = req.body; // ✅ get description too

    if (!req.file) {
        console.error("No file received");
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filename = req.file.filename;

    const sql = "INSERT INTO posters (title, category, description, imageUrl) VALUES (?, ?, ?, ?)";
    db.query(sql, [title, category, description, filename], (err, result) => {
        if (err) {
            console.error("❌ Poster upload error:", err);
            return res.status(500).json({ success: false, message: "Failed to upload poster" });
        }
        res.json({ success: true, message: "📢 Poster uploaded successfully!", filename });
    });
});


// 👉 Fetch All Posters
app.get("/get-posters", (req, res) => {
    const sql = "SELECT * FROM posters ORDER BY id DESC";
    db.query(sql, (err, results) => {
        if (err) {
            console.error("❌ Fetch posters error:", err);
            return res.status(500).json({ success: false, message: "Error fetching posters" });
        }
        res.json({ success: true, posters: results });
    });
});

// Start Server
app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
});
