import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

// Check if admin exists
router.get('/checkAdmin', async (req, res) => {
    try {
        const admin = await User.findOne({ role: 'admin' });
        res.status(200).json({ adminExists: admin ? true : false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create admin (for first-time setup)
router.post('/createAdmin', async (req, res) => {
    const { adminEmail, adminPassword } = req.body;

    try {
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = new User({
            email: adminEmail,
            password: hashedPassword,
            role: 'admin',
        });

        await admin.save();
        res.status(200).json({ message: 'Admin account created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create teacher (admin action - simple open endpoint for now)
router.post('/createTeacher', async (req, res) => {
    const { email, password, teacherId } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const teacher = new User({
            email,
            password: hashedPassword,
            role: 'teacher',
            teacherId: teacherId || ''
        });

        await teacher.save();
        res.status(200).json({ message: 'Teacher account created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create student (admin action)
router.post('/createStudent', async (req, res) => {
    const { email, password, studentId } = req.body;

    try {
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const student = new User({
            email,
            password: hashedPassword,
            role: 'student',
            rollNumber: studentId || ''  // Using rollNumber from the schema for studentId
        });

        await student.save();
        res.status(200).json({ message: 'Student account created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ token, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change Password Route
router.post('/changePassword', async (req, res) => {
    const { email, currentPassword, newPassword, userType } = req.body;

    try {
        // Find user by email and role
        const user = await User.findOne({ email, role: userType });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Save updated password
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
