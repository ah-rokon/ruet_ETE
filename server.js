import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import User from './models/userModel.js';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';


dotenv.config();

// Fix __dirname for ES modules (import/export syntax)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(bodyParser.json());
// Serve static files from public/ (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Keep JSON body parsing
// (already added above)

// Routes and startup are handled inside an async function so we don't use top-level await
async function startServer() {
    try {
        // Database Connection
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        // Check if the admin exists; if not, create one.
        // If an admin exists but the password isn't hashed, hash & update it.
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            const hashed = await bcrypt.hash('admin123', 10);
            admin = new User({
                email: 'admin@example.com',
                password: hashed,
                role: 'admin',
            });
            await admin.save();
            console.log('Admin account created!');
        } else {
            // Simple check: bcrypt hashes typically start with "$2". If not hashed, update it.
            if (typeof admin.password === 'string' && !admin.password.startsWith('$2')) {
                admin.password = await bcrypt.hash(admin.password, 10);
                await admin.save();
                console.log('Existing admin password hashed/updated.');
            }
        }

    // Routes
    app.use('/auth', authRoutes);
    app.use('/api', courseRoutes);
    app.use('/series', (await import('./routes/seriesRoutes.js')).default);
    app.use('/notices', (await import('./routes/noticeRoutes.js')).default);

        // Root route (optional - express.static will already serve index.html)
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        });

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server started on  http://localhost:${PORT}`));
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServer();
