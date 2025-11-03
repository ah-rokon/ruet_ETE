import mongoose from 'mongoose';

const teacherCourseSchema = new mongoose.Schema({
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
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
    academicYear: {
        type: String,
        required: true
    }
});

// Compound index to prevent duplicate assignments
teacherCourseSchema.index({ 
    courseId: 1, 
    semester: 1, 
    series: 1, 
    academicYear: 1 
}, { unique: true });

// Index to help enforce teacher course limits
teacherCourseSchema.index({ 
    teacherId: 1, 
    semester: 1, 
    series: 1, 
    academicYear: 1 
});

// Middleware to validate teacher course limits
teacherCourseSchema.pre('save', async function(next) {
    try {
        const TeacherCourse = this.constructor;
        const Course = mongoose.model('Course');
        
        // Get the course type (theory/sessional)
        const course = await Course.findById(this.courseId);
        if (!course) {
            throw new Error('Course not found');
        }

        // Find existing assignments for this teacher in the same semester/series/year
        const existingAssignments = await TeacherCourse.find({
            teacherId: this.teacherId,
            semester: this.semester,
            series: this.series,
            academicYear: this.academicYear
        }).populate('courseId');

        // Count theory and sessional courses
        const theoryCourses = existingAssignments.filter(a => a.courseId.type === 'theory').length;
        const sessionalCourses = existingAssignments.filter(a => a.courseId.type === 'sessional').length;

        // Enforce limits
        if (course.type === 'theory' && theoryCourses >= 1) {
            throw new Error('Teacher already has the maximum number of theory courses for this semester');
        }
        if (course.type === 'sessional' && sessionalCourses >= 1) {
            throw new Error('Teacher already has the maximum number of sessional courses for this semester');
        }

        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model('TeacherCourse', teacherCourseSchema);