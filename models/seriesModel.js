import mongoose from 'mongoose';

const seriesSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    }
});

export default mongoose.model('Series', seriesSchema);