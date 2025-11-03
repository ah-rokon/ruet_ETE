import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['theory', 'sessional'],
        required: true
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    series: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true,
        min: 0.75,
        max: 4
    }
});

export default mongoose.model('Course', courseSchema);