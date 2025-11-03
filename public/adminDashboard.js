// Fetch and display all courses
async function loadCourses() {
    try {
        const response = await fetch('/api/courses');
        const courses = await response.json();
        const coursesList = document.getElementById('coursesList');
        const courseSelect = document.getElementById('course');
        
        // Clear existing options (except the first one)
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        
        // Update both the list and select dropdown
        coursesList.innerHTML = '<h3>Available Courses</h3><ul>' +
            courses.map(course => `
                <li>${course.courseCode} - ${course.name} (${course.type}, ${course.credits} credits)
                    Semester: ${course.semester}, Series: ${course.series}</li>
            `).join('') + '</ul>';
            
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course._id;
            option.textContent = `${course.courseCode} - ${course.name} (${course.type})`;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
    }
}

// Fetch and display all teachers
async function loadTeachers() {
    try {
        const response = await fetch('/api/teachers');
        const teachers = await response.json();
        const teacherSelect = document.getElementById('teacher');
        
        // Clear existing options (except the first one)
        teacherSelect.innerHTML = '<option value="">Select Teacher</option>';
        
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher._id;
            option.textContent = `${teacher.email} (${teacher.teacherId || 'No ID'})`;
            teacherSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading teachers:', error);
    }
}

// Load current assignments
async function loadAssignments() {
    try {
        const teacherId = document.getElementById('teacher').value;
        if (!teacherId) return;

        const response = await fetch(`/api/teacher-courses/${teacherId}`);
        const assignments = await response.json();
        const assignmentsList = document.getElementById('assignmentsList');
        
        assignmentsList.innerHTML = '<h3>Current Assignments</h3><ul>' +
            assignments.map(assignment => `
                <li>
                    ${assignment.courseId.courseCode} - ${assignment.courseId.name}
                    (${assignment.semester}, Series ${assignment.series}, ${assignment.academicYear})
                    <button onclick="removeAssignment('${assignment._id}')">Remove</button>
                </li>
            `).join('') + '</ul>';
    } catch (error) {
        console.error('Error loading assignments:', error);
    }
}

// Handle course creation
document.getElementById('courseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('courseMessage');
    
    try {
        const response = await fetch('/api/courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                courseCode: document.getElementById('courseCode').value,
                name: document.getElementById('courseName').value,
                type: document.getElementById('courseType').value,
                semester: parseInt(document.getElementById('semester').value),
                series: parseInt(document.getElementById('series').value),
                credits: parseFloat(document.getElementById('credits').value)
            })
        });

        const data = await response.json();
        if (response.ok) {
            messageEl.className = 'success';
            messageEl.textContent = 'Course created successfully';
            e.target.reset();
            loadCourses();
        } else {
            messageEl.className = 'error';
            messageEl.textContent = data.error || 'Failed to create course';
        }
    } catch (error) {
        messageEl.className = 'error';
        messageEl.textContent = 'Error creating course';
    }
});

// Handle course assignment
document.getElementById('assignmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const messageEl = document.getElementById('assignmentMessage');
    
    try {
        const response = await fetch('/api/assign-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teacherId: document.getElementById('teacher').value,
                courseId: document.getElementById('course').value,
                semester: parseInt(document.getElementById('assignSemester').value),
                series: parseInt(document.getElementById('assignSeries').value),
                academicYear: document.getElementById('academicYear').value
            })
        });

        const data = await response.json();
        if (response.ok) {
            messageEl.className = 'success';
            messageEl.textContent = 'Course assigned successfully';
            loadAssignments();
        } else {
            messageEl.className = 'error';
            messageEl.textContent = data.error || 'Failed to assign course';
        }
    } catch (error) {
        messageEl.className = 'error';
        messageEl.textContent = 'Error assigning course';
    }
});

// Handle assignment removal
async function removeAssignment(assignmentId) {
    if (!confirm('Are you sure you want to remove this assignment?')) return;
    
    try {
        const response = await fetch(`/api/teacher-courses/${assignmentId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadAssignments();
        } else {
            alert('Failed to remove assignment');
        }
    } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Error removing assignment');
    }
}

// Event listener for teacher selection change
document.getElementById('teacher').addEventListener('change', loadAssignments);

// --- SERIES MANAGEMENT ---
async function loadSeries() {
    try {
        const response = await fetch('/series');
        const seriesArr = await response.json();
        const seriesList = document.getElementById('seriesList');
        seriesList.innerHTML = '';
        seriesArr.forEach(s => {
            const block = document.createElement('div');
            block.textContent = s.year;
            block.className = 'dashboard-section';
            block.style.cursor = 'pointer';
            block.style.minWidth = '60px';
            block.style.textAlign = 'center';
            block.style.fontWeight = 'bold';
            block.style.background = '#f3f6fa';
            block.style.border = '2px solid #0366d6';
            block.style.marginBottom = '0';
            block.onclick = () => {
                // Redirect to public notice page for this series
                window.location.href = `/notice.html?series=${s.year}`;
            };
            seriesList.appendChild(block);
        });
    } catch (error) {
        console.error('Error loading series:', error);
    }
}

document.getElementById('seriesForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('seriesMessage');
    msg.textContent = '';
    try {
        const year = parseInt(document.getElementById('seriesYear').value);
        const res = await fetch('/series', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ year })
        });
        const data = await res.json();
        if (res.ok) {
            msg.className = 'success';
            msg.textContent = 'Series added successfully';
            e.target.reset();
            loadSeries();
        } else {
            msg.className = 'error';
            msg.textContent = data.error || 'Failed to add series';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = err.message || 'Network error';
    }
});

// Initial load
loadSeries();
loadTeachers(); // Load initial teacher list

// Inline create teacher/student handlers and toggles
document.getElementById('showCreateTeacher').addEventListener('click', () => {
    const teacherContainer = document.getElementById('createTeacherContainer');
    const studentContainer = document.getElementById('createStudentContainer');
    teacherContainer.style.display = teacherContainer.style.display === 'none' ? 'block' : 'none';
    studentContainer.style.display = 'none'; // Hide student form when showing teacher
});

document.getElementById('showCreateStudent').addEventListener('click', () => {
    const teacherContainer = document.getElementById('createTeacherContainer');
    const studentContainer = document.getElementById('createStudentContainer');
    studentContainer.style.display = studentContainer.style.display === 'none' ? 'block' : 'none';
    teacherContainer.style.display = 'none'; // Hide teacher form when showing student
});

// Create teacher inline
document.getElementById('createTeacherInlineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('teacherInlineMessage');
    const form = document.getElementById('createTeacherInlineForm');
    msg.textContent = '';
    
    try {
        const res = await fetch('/auth/createTeacher', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('teacherEmailInline').value,
                password: document.getElementById('teacherPasswordInline').value,
                teacherId: document.getElementById('teacherIdInline').value
            })
        });
        const data = await res.json();
        if (res.ok) {
            msg.className = 'success';
            msg.textContent = data.message || 'Teacher created successfully';
            form.reset(); // Clear the form
            document.getElementById('createTeacherContainer').style.display = 'none'; // Hide the form
            await loadTeachers(); // Refresh teacher list
        } else {
            msg.className = 'error';
            msg.textContent = data.message || data.error || 'Failed to create teacher';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = err.message || 'Network error';
        console.error('Error creating teacher:', err);
    }
});

// Create student inline
document.getElementById('createStudentInlineForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('studentInlineMessage');
    const form = document.getElementById('createStudentInlineForm');
    msg.textContent = '';
    
    try {
        const res = await fetch('/auth/createStudent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('studentEmailInline').value,
                password: document.getElementById('studentPasswordInline').value,
                studentId: document.getElementById('studentIdInline').value
            })
        });
        const data = await res.json();
        if (res.ok) {
            msg.className = 'success';
            msg.textContent = data.message || 'Student created successfully';
            form.reset(); // Clear the form
            document.getElementById('createStudentContainer').style.display = 'none'; // Hide the form
        } else {
            msg.className = 'error';
            msg.textContent = data.message || data.error || 'Failed to create student';
        }
    } catch (err) {
        msg.className = 'error';
        msg.textContent = err.message || 'Network error';
        console.error('Error creating student:', err);
    }
});