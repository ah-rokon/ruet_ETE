import express from 'express';
import Series from '../models/seriesModel.js';

const router = express.Router();

// GET /series - list all series
router.get('/', async (req, res) => {
	try {
		const all = await Series.find({}).sort({ year: 1 }).lean();
		res.json(all);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// POST /series - create new series
router.post('/', async (req, res) => {
	try {
		const { year } = req.body;
		if (typeof year !== 'number') return res.status(400).json({ error: 'Year must be a number' });
		const existing = await Series.findOne({ year });
		if (existing) return res.status(400).json({ error: 'Series already exists' });
		const s = new Series({ year });
		await s.save();
		res.status(201).json(s);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

export default router;
