// Notice Management JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the notice management UI
    initNoticeManagement();
    
    // Set up series block click handlers
    setupSeriesBlocks();
});

// Set up click handlers for series blocks
function setupSeriesBlocks() {
    const seriesBlocks = document.querySelectorAll('[id^="series-"]');
    seriesBlocks.forEach(block => {
        block.addEventListener('click', () => {
            const series = block.id.split('-')[1];
            showSeriesNoticeManagement(series);
        });
    });
}

async function initNoticeManagement() {
    // Load existing notices for the current series
    const currentSeries = document.querySelector('.current-series')?.dataset?.series;
    if (currentSeries) {
        await loadNotices({ series: currentSeries });
    }
    
    // Set up event listeners for the notice form
    const noticeForm = document.getElementById('noticeForm');
    if (noticeForm) {
        noticeForm.addEventListener('submit', handleNoticeSubmission);
    }
    
    // Set up filter listeners
    setupFilters();
}

async function loadNotices(filters = {}) {
    try {
        // Get current series from the page if it exists
        const currentSeries = document.querySelector('.current-series')?.dataset?.series;
        if (currentSeries && !filters.series) {
            filters.series = currentSeries;
        }

        // Construct query string from filters
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`/notices?${queryString}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch notices');
        }

        const notices = await response.json();
        displayNotices(notices);
    } catch (error) {
        showError('Failed to load notices');
        console.error(error);
    }
}

// Function to show notice management for a specific series
async function showSeriesNoticeManagement(series) {
    try {
        // Update current series
        document.querySelectorAll('.current-series').forEach(el => {
            el.classList.remove('current-series');
        });
        document.getElementById(`series-${series}`).classList.add('current-series');

        // Update notice form series field
        const seriesInput = document.getElementById('noticeSeries');
        if (seriesInput) {
            seriesInput.value = series;
        }

        // Load notices for this series
        await loadNotices({ series });

        // Show the notice management section
        const noticeSection = document.getElementById('noticeManagement');
        if (noticeSection) {
            noticeSection.style.display = 'block';
            
            // Update section title to include series
            const sectionTitle = noticeSection.querySelector('h2');
            if (sectionTitle) {
                sectionTitle.textContent = `Notice Management - Series ${series}`;
            }
        }
    } catch (error) {
        showError('Failed to load series notice management');
        console.error(error);
    }
}

function displayNotices(notices) {
    const noticesList = document.getElementById('noticesList');
    if (!noticesList) return;
    
    noticesList.innerHTML = '';
    
    notices.forEach(notice => {
        const noticeElement = createNoticeElement(notice);
        noticesList.appendChild(noticeElement);
    });
}

function createNoticeElement(notice) {
    const div = document.createElement('div');
    div.className = 'notice-item';
    
    div.innerHTML = `
        <h3>${notice.title}</h3>
        <p>${notice.description}</p>
        ${notice.fileUrl ? `<a href="${notice.fileUrl}" target="_blank">View Attachment</a>` : ''}
        <div class="notice-meta">
            <span>Series: ${notice.series}</span>
            <span>Posted: ${new Date(notice.createdAt).toLocaleDateString()}</span>
        </div>
        <div class="notice-actions">
            <button onclick="editNotice('${notice._id}')">Edit</button>
            <button onclick="deleteNotice('${notice._id}')">Delete</button>
        </div>
    `;
    
    return div;
}

async function handleNoticeSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
        // Get current series from the page
        const currentSeries = document.querySelector('.current-series')?.dataset?.series;
        if (currentSeries && !formData.get('series')) {
            formData.set('series', currentSeries);
        }

        const response = await fetch('/notices', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create notice');
        }
        
        await loadNotices(); // Reload notices for current series
        event.target.reset(); // Reset form
        
        // Reset series input to current series
        if (currentSeries) {
            document.getElementById('noticeSeries').value = currentSeries;
        }
        
        showSuccess('Notice created successfully');
    } catch (error) {
        showError(error.message || 'Failed to create notice');
        console.error(error);
    }
}

async function editNotice(noticeId) {
    try {
        const response = await fetch(`/notices/${noticeId}`);
        const notice = await response.json();
        
        // Populate form with notice data
        document.getElementById('noticeTitle').value = notice.title;
        document.getElementById('noticeDescription').value = notice.description;
        document.getElementById('noticeSeries').value = notice.series;
        
        // Update form for edit mode
        const form = document.getElementById('noticeForm');
        form.dataset.mode = 'edit';
        form.dataset.noticeId = noticeId;
    } catch (error) {
        showError('Failed to load notice for editing');
        console.error(error);
    }
}

async function deleteNotice(noticeId) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    
    try {
        const response = await fetch(`/notices/${noticeId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete notice');
        
        await loadNotices(); // Reload notices
        showSuccess('Notice deleted successfully');
    } catch (error) {
        showError('Failed to delete notice');
        console.error(error);
    }
}

function setupFilters() {
    const filterForm = document.getElementById('noticeFilters');
    if (filterForm) {
        filterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const filters = Object.fromEntries(formData.entries());
            loadNotices(filters);
        });
    }
}

function showSuccess(message) {
    // Implement your success notification
    alert(message);
}

function showError(message) {
    // Implement your error notification
    alert(message);
}