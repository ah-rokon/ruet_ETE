// Notice page script: login, upload (teacher/admin), filters, and access logging
(async function(){
    function getQueryParam(name) {
        const params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    const series = getQueryParam('series');
    const pageTitle = document.getElementById('pageTitle');
    const noticesList = document.getElementById('noticesList');
    const loading = document.getElementById('loading');
    const loginForm = document.getElementById('loginForm');
    const loginMessage = document.getElementById('loginMessage');
    const postSection = document.getElementById('postSection');
    const postForm = document.getElementById('postForm');
    const postMessage = document.getElementById('postMessage');
    const noticeCourse = document.getElementById('noticeCourse');
    const noticeSeriesInput = document.getElementById('noticeSeries');
    const filterTeacher = document.getElementById('filterTeacher');
    const filterCourse = document.getElementById('filterCourse');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');

    let authToken = localStorage.getItem('authToken') || null;
    let authRole = localStorage.getItem('authRole') || null;

    if (!series) {
        loading.textContent = 'No series specified.';
        return;
    }

    pageTitle.textContent = `Notices for series ${series}`;

    async function loadTeachersAndCourses(){
        try{
            const [tRes, cRes] = await Promise.all([
                fetch('/api/teachers'),
                fetch('/api/courses')
            ]);
            if (tRes.ok){
                const teachers = await tRes.json();
                teachers.forEach(t => {
                    const opt = document.createElement('option');
                    opt.value = t._id;
                    opt.textContent = t.email;
                    filterTeacher.appendChild(opt);
                });
            }
            if (cRes.ok){
                const courses = await cRes.json();
                courses.forEach(c => {
                    const opt = document.createElement('option');
                    opt.value = c._id;
                    opt.textContent = `${c.courseCode || ''} - ${c.name}`;
                    filterCourse.appendChild(opt);
                    const opt2 = opt.cloneNode(true);
                    noticeCourse.appendChild(opt2);
                });
            }
        }catch(err){
            console.error('Failed to load teachers/courses', err);
        }
    }

    function refreshAuthUI(){
        authToken = localStorage.getItem('authToken');
        authRole = localStorage.getItem('authRole');
        if (authToken && (authRole === 'admin' || authRole === 'teacher')){
            postSection.style.display = 'block';
            noticeSeriesInput.value = series;
        } else {
            postSection.style.display = 'none';
        }
    }

    async function loadNotices(filters) {
        try {
            let res, notices;
            const needsAuth = filters && (filters.teacher || filters.course) && authToken;
            if (!filters || (Object.keys(filters).length === 0)){
                res = await fetch(`/notices/public/series/${encodeURIComponent(series)}`);
            } else if (!filters.teacher && !filters.course) {
                res = await fetch(`/notices/public/series/${encodeURIComponent(filters.series || series)}`);
            } else {
                const params = new URLSearchParams();
                params.set('series', filters.series || series);
                if (filters.teacher) params.set('teacher', filters.teacher);
                if (filters.course) params.set('course', filters.course);
                res = await fetch(`/notices?${params.toString()}`, {
                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
                });
            }

            if (!res.ok) {
                let body;
                try { body = await res.json(); } catch(e){ body = null; }
                throw new Error(body && body.error ? body.error : 'Failed to load notices');
            }
            notices = await res.json();

            loading.style.display = 'none';
            if (!notices || notices.length === 0) {
                noticesList.innerHTML = '<p>No notices posted by admin for this series.</p>';
                return;
            }

            noticesList.innerHTML = notices.map(n => {
                const fileLink = n.fileUrl ? `<a class="notice-file" data-id="${n._id}" href="${n.fileUrl}" target="_blank">Download</a>` : '';
                const teacher = n.teacher && n.teacher.email ? `<span>By: ${n.teacher.email}</span>` : '';
                const createdAt = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
                return `
                    <article class="notice-item">
                        <h3>${escapeHtml(n.title)}</h3>
                        <div class="notice-meta">${teacher} <span>${createdAt}</span></div>
                        <p>${escapeHtml(n.description || '')}</p>
                        <div class="notice-actions">${fileLink}</div>
                    </article>
                `;
            }).join('');

            document.querySelectorAll('.notice-file').forEach(a => {
                a.addEventListener('click', async () => {
                    const id = a.getAttribute('data-id');
                    if (authToken && id){
                        try{
                            await fetch(`/notices/${id}/access`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${authToken}` }
                            });
                        }catch(e){ console.warn('Failed to log access', e); }
                    }
                });
            });
        }
        catch (err) {
            loading.textContent = 'Error loading notices: ' + err.message;
            console.error(err);
        }
    }

    function escapeHtml(str){
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Login handler
    if (loginForm){
        loginForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            loginMessage.textContent = '';
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            try{
                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.message || body.error || 'Login failed');
                localStorage.setItem('authToken', body.token);
                localStorage.setItem('authRole', body.role);
                loginMessage.textContent = 'Logged in';
                refreshAuthUI();
            }catch(err){
                loginMessage.textContent = 'Login failed: ' + err.message;
            }
        });
    }

    // Post form handler - requires auth (teacher/admin)
    if (postForm){
        postForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            postMessage.textContent = '';
            const formData = new FormData();
            formData.append('title', document.getElementById('noticeTitle').value);
            formData.append('description', document.getElementById('noticeDescription').value);
            formData.append('series', document.getElementById('noticeSeries').value || series);
            const courseVal = document.getElementById('noticeCourse').value;
            if (courseVal) formData.append('course', courseVal);
            const fileInput = document.getElementById('noticeFile');
            if (fileInput && fileInput.files && fileInput.files[0]) formData.append('file', fileInput.files[0]);

            try{
                const res = await fetch('/notices', {
                    method: 'POST',
                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
                    body: formData
                });
                const body = await res.json();
                if (!res.ok) throw new Error(body.error || 'Failed to post notice');
                postMessage.textContent = 'Notice posted';
                postForm.reset();
                await loadNotices();
            }catch(err){
                postMessage.textContent = 'Failed: ' + err.message;
            }
        });
    }

    // Filters
    applyFiltersBtn.addEventListener('click', async ()=>{
        const teacher = filterTeacher.value;
        const course = filterCourse.value;
        if ((teacher || course) && !authToken){
            alert('Filtering by teacher or course requires login. Please login first.');
            return;
        }
        loading.style.display = 'block';
        loading.textContent = 'Loading notices...';
        await loadNotices({ series, teacher, course });
    });

    clearFiltersBtn.addEventListener('click', async ()=>{
        filterTeacher.value = '';
        filterCourse.value = '';
        loading.style.display = 'block';
        loading.textContent = 'Loading notices...';
        await loadNotices();
    });

    // Initialize
    refreshAuthUI();
    await loadTeachersAndCourses();
    await loadNotices();
})();
