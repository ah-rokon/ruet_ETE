import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    fileUrl: String, // Path or URL to uploaded file
    fileType: { type: String, enum: ['image', 'pdf', 'zip', 'docx', 'pptx', 'text'], required: true },
    series: { type: Number, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    accessLog: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, accessedAt: Date }]
});

export default mongoose.model('Notice', noticeSchema);