import express from 'express';
import Notice from '../models/noticeModel.js';

const router = express.Router();

// GET /notices - list notices (optionally filter by series query)
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.series) filter.series = parseInt(req.query.series);
        const notices = await Notice.find(filter).sort({ createdAt: -1 }).lean();
        res.json(notices);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /notices - create a notice (minimal, used by admin interfaces if needed)
router.post('/', async (req, res) => {
    try {
        const { title, description, fileUrl, fileType, series, createdBy, course } = req.body;
        const n = new Notice({ title, description, fileUrl, fileType, series, createdBy, course });
        await n.save();
        res.status(201).json(n);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
