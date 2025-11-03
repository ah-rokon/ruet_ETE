import express from 'express';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import TeacherCourse from '../models/teacherCourseModel.js';

const router = express.Router();

// GET /api/courses - list all courses
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find({}).lean();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/courses - create a course
router.post('/courses', async (req, res) => {
    try {
        const { courseCode, name, type, semester, series, credits } = req.body;
        const existing = await Course.findOne({ courseCode });
        if (existing) return res.status(400).json({ error: 'Course code already exists' });

        const course = new Course({ courseCode, name, type, semester, series, credits });
        await course.save();
        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teachers - list all teachers
router.get('/teachers', async (req, res) => {
    try {
        const teachers = await User.find({ role: 'teacher' }).lean();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher-courses/:teacherId - assignments for a teacher
router.get('/teacher-courses/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const assignments = await TeacherCourse.find({ teacherId }).populate('courseId').lean();
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/teacher-courses/:id - remove an assignment
router.delete('/teacher-courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await TeacherCourse.findByIdAndDelete(id);
        res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/assign-course - assign a course to a teacher
router.post('/assign-course', async (req, res) => {
    try {
        const { teacherId, courseId, semester, series, academicYear } = req.body;
        const assignment = new TeacherCourse({ teacherId, courseId, semester, series, academicYear });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (err) {
        // If mongoose validation or unique index errors, return useful message
        const message = err && err.message ? err.message : 'Failed to assign course';
        res.status(400).json({ error: message });
    }
});

export default router;