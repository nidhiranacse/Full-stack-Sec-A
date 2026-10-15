// ============================================
// Admin Module - Admin Panel Pages
// ============================================

function renderAdminPage() {
    if (!isCurrentUserAdmin()) {
        return `<div class="empty-state" style="padding-top:8rem">
            <i class="fas fa-lock"></i>
            <h3>Access Denied</h3>
            <p>You need admin privileges to access this page.</p>
            <button class="btn btn-primary" onclick="navigateTo('home')">Go Home</button>
        </div>`;
    }

    return `
        <div class="page-header fade-in">
            <h1><i class="fas fa-cog" style="color:var(--primary-light)"></i> Admin Panel</h1>
            <p>Manage events, resources, and view statistics.</p>
        </div>
        <div class="section" style="padding-top:1rem">
            <div id="adminStats" class="stats-grid">
                <div class="stat-card"><div class="loading" style="padding:1rem"><div class="spinner"></div></div></div>
                <div class="stat-card"><div class="loading" style="padding:1rem"><div class="spinner"></div></div></div>
                <div class="stat-card"><div class="loading" style="padding:1rem"><div class="spinner"></div></div></div>
                <div class="stat-card"><div class="loading" style="padding:1rem"><div class="spinner"></div></div></div>
            </div>

            <div class="admin-tabs">
                <button class="admin-tab active" onclick="switchAdminTab('events', this)">
                    <i class="fas fa-calendar-alt"></i> Events
                </button>
                <button class="admin-tab" onclick="switchAdminTab('resources', this)">
                    <i class="fas fa-book"></i> Resources
                </button>
                <button class="admin-tab" onclick="switchAdminTab('students', this)">
                    <i class="fas fa-users"></i> Students
                </button>
                <button class="admin-tab" onclick="switchAdminTab('recent', this)">
                    <i class="fas fa-history"></i> Recent Activity
                </button>
            </div>

            <div id="adminTabEvents" class="tab-content active"></div>
            <div id="adminTabResources" class="tab-content"></div>
            <div id="adminTabStudents" class="tab-content"></div>
            <div id="adminTabRecent" class="tab-content"></div>
        </div>
    `;
}

function switchAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    
    const tabId = 'adminTab' + tab.charAt(0).toUpperCase() + tab.slice(1);
    document.getElementById(tabId).classList.add('active');

    // Load data for tab
    switch(tab) {
        case 'events': loadAdminEvents(); break;
        case 'resources': loadAdminResources(); break;
        case 'students': loadAdminStudents(); break;
        case 'recent': loadAdminRecent(); break;
    }
}

async function loadAdminDashboard() {
    try {
        const data = await AdminAPI.getStats();
        const stats = data.stats;

        document.getElementById('adminStats').innerHTML = `
            <div class="stat-card fade-in">
                <div class="stat-icon" style="background:rgba(129,140,248,0.1); color:#818cf8;">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <div class="stat-value">${stats.totalEvents}</div>
                <div class="stat-label">Total Events</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="background:rgba(52,211,153,0.1); color:#34d399;">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-value">${stats.totalStudents}</div>
                <div class="stat-label">Students</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="background:rgba(251,191,36,0.1); color:#fbbf24;">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="stat-value">${stats.totalRegistrations}</div>
                <div class="stat-label">Registrations</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="background:rgba(244,114,182,0.1); color:#f472b6;">
                    <i class="fas fa-book"></i>
                </div>
                <div class="stat-value">${stats.totalResources}</div>
                <div class="stat-label">Resources</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="background:rgba(34,211,238,0.1); color:#22d3ee;">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-value">${stats.upcomingEvents}</div>
                <div class="stat-label">Upcoming Events</div>
            </div>
        `;

        // Store recent for the tab
        window._adminRecentRegistrations = data.recentRegistrations;
    } catch (error) {
        document.getElementById('adminStats').innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <p>Error loading stats: ${error.message}</p>
            </div>`;
    }

    // Load first tab
    loadAdminEvents();
}

// ---- Admin Events Tab ----
async function loadAdminEvents() {
    const container = document.getElementById('adminTabEvents');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading events...</div>';

    try {
        const data = await EventsAPI.getAll({ limit: 100 });

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem">
                <h3 style="font-size:1rem">All Events (${data.events.length})</h3>
                <button class="btn btn-primary btn-sm" onclick="openEventModal()">
                    <i class="fas fa-plus"></i> Add Event
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Category</th>
                            <th>Date</th>
                            <th>Venue</th>
                            <th>Seats</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.events.map(event => {
                            const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
                            const registered = event.total_seats - event.available_seats;
                            return `
                                <tr>
                                    <td><strong>${escapeHtml(event.title)}</strong></td>
                                    <td><span style="color:${cat.color}">${cat.label}</span></td>
                                    <td>${formatDate(event.event_date)}</td>
                                    <td>${escapeHtml(event.venue)}</td>
                                    <td>${registered}/${event.total_seats}</td>
                                    <td>
                                        <div style="display:flex; gap:0.3rem">
                                            <button class="btn btn-sm btn-secondary" onclick="viewEventRegistrations(${event.id}, '${escapeHtml(event.title)}')" title="View Registrations">
                                                <i class="fas fa-users"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" onclick="openEventModal(${event.id})" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><p>Error: ${error.message}</p></div>`;
    }
}

// View registrations for an event
async function viewEventRegistrations(eventId, eventTitle) {
    openModal(`<h2>Registrations: ${eventTitle}</h2><div class="loading"><div class="spinner"></div></div>`);

    try {
        const data = await EventsAPI.getRegistrations(eventId);
        const modal = document.getElementById('modalContent');

        if (data.registrations.length === 0) {
            modal.innerHTML = `<h2>Registrations: ${eventTitle}</h2>
                <div class="empty-state"><i class="fas fa-users"></i><h3>No registrations yet</h3></div>`;
            return;
        }

        modal.innerHTML = `
            <h2>Registrations: ${eventTitle}</h2>
            <p style="color:var(--text-muted);margin-bottom:1rem;font-size:0.85rem">${data.registrations.length} student(s) registered</p>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Registered On</th></tr></thead>
                    <tbody>
                        ${data.registrations.map(r => `
                            <tr>
                                <td>${escapeHtml(r.name)}</td>
                                <td>${escapeHtml(r.email)}</td>
                                <td>${formatDate(r.registered_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        document.getElementById('modalContent').innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Open Add/Edit Event modal
async function openEventModal(eventId = null) {
    let event = null;
    if (eventId) {
        try {
            const data = await EventsAPI.getById(eventId);
            event = data.event;
        } catch (error) {
            showToast('Error loading event', 'error');
            return;
        }
    }

    const title = event ? 'Edit Event' : 'Add New Event';
    const btnText = event ? 'Update Event' : 'Create Event';

    openModal(`
        <h2>${title}</h2>
        <form id="eventForm" onsubmit="handleEventSubmit(event, ${eventId})">
            <div class="form-group">
                <label>Event Title *</label>
                <input type="text" class="form-control" id="eventTitle" value="${event ? escapeHtml(event.title) : ''}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control" id="eventCategory">
                        <option value="workshop" ${event?.category === 'workshop' ? 'selected' : ''}>Workshop</option>
                        <option value="hackathon" ${event?.category === 'hackathon' ? 'selected' : ''}>Hackathon</option>
                        <option value="seminar" ${event?.category === 'seminar' ? 'selected' : ''}>Seminar</option>
                        <option value="placement" ${event?.category === 'placement' ? 'selected' : ''}>Placement Drive</option>
                        <option value="cultural" ${event?.category === 'cultural' ? 'selected' : ''}>Cultural</option>
                        <option value="sports" ${event?.category === 'sports' ? 'selected' : ''}>Sports</option>
                        <option value="other" ${event?.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Total Seats</label>
                    <input type="number" class="form-control" id="eventSeats" value="${event ? event.total_seats : 50}" min="1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date *</label>
                    <input type="date" class="form-control" id="eventDate" value="${event ? event.event_date.split('T')[0] : ''}" required>
                </div>
                <div class="form-group">
                    <label>Time *</label>
                    <input type="time" class="form-control" id="eventTime" value="${event ? event.event_time.substring(0,5) : ''}" required>
                </div>
            </div>
            <div class="form-group">
                <label>Venue *</label>
                <input type="text" class="form-control" id="eventVenue" value="${event ? escapeHtml(event.venue) : ''}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" id="eventDescription" rows="4">${event ? escapeHtml(event.description || '') : ''}</textarea>
            </div>
            <div style="display:flex; gap:0.75rem; justify-content:flex-end">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> ${btnText}</button>
            </div>
        </form>
    `);
}

async function handleEventSubmit(e, eventId) {
    e.preventDefault();
    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        category: document.getElementById('eventCategory').value,
        event_date: document.getElementById('eventDate').value,
        event_time: document.getElementById('eventTime').value,
        venue: document.getElementById('eventVenue').value,
        total_seats: parseInt(document.getElementById('eventSeats').value)
    };

    try {
        if (eventId) {
            await EventsAPI.update(eventId, eventData);
            showToast('Event updated successfully!', 'success');
        } else {
            await EventsAPI.create(eventData);
            showToast('Event created successfully!', 'success');
        }
        closeModal();
        loadAdminEvents();
        loadAdminDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? All registrations will also be removed.')) return;
    try {
        await EventsAPI.delete(eventId);
        showToast('Event deleted', 'info');
        loadAdminEvents();
        loadAdminDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ---- Admin Resources Tab ----
async function loadAdminResources() {
    const container = document.getElementById('adminTabResources');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

    try {
        const data = await ResourcesAPI.getAll({ limit: 100 });

        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem">
                <h3 style="font-size:1rem">All Resources (${data.resources.length})</h3>
                <button class="btn btn-primary btn-sm" onclick="openResourceModal()">
                    <i class="fas fa-upload"></i> Upload Resource
                </button>
            </div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Title</th><th>Type</th><th>Subject</th><th>Actions</th></tr></thead>
                    <tbody>
                        ${data.resources.map(r => `
                            <tr>
                                <td><strong>${escapeHtml(r.title)}</strong></td>
                                <td>${r.category}</td>
                                <td>${escapeHtml(r.subject || '-')}</td>
                                <td>
                                    <div style="display:flex; gap:0.3rem">
                                        <a href="${ResourcesAPI.getDownloadUrl(r.id)}" class="btn btn-sm btn-secondary" target="_blank"><i class="fas fa-download"></i></a>
                                        <button class="btn btn-sm btn-danger" onclick="deleteResource(${r.id})"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><p>Error: ${error.message}</p></div>`;
    }
}

function openResourceModal() {
    openModal(`
        <h2>Upload Resource</h2>
        <form id="resourceForm" onsubmit="handleResourceUpload(event)">
            <div class="form-group">
                <label>Title *</label>
                <input type="text" class="form-control" id="resTitle" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Category</label>
                    <select class="form-control" id="resCategory">
                        <option value="notes">Notes</option>
                        <option value="pyq">Previous Year Paper</option>
                        <option value="assignment">Assignment</option>
                        <option value="reference">Reference</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Subject</label>
                    <input type="text" class="form-control" id="resSubject" placeholder="e.g. Data Structures">
                </div>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" id="resDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>File * (PDF, DOC, PPT, TXT, ZIP — max 10MB)</label>
                <input type="file" class="form-control" id="resFile" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip" required>
            </div>
            <div style="display:flex; gap:0.75rem; justify-content:flex-end">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary"><i class="fas fa-upload"></i> Upload</button>
            </div>
        </form>
    `);
}

async function handleResourceUpload(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', document.getElementById('resTitle').value);
    formData.append('description', document.getElementById('resDescription').value);
    formData.append('category', document.getElementById('resCategory').value);
    formData.append('subject', document.getElementById('resSubject').value);
    formData.append('file', document.getElementById('resFile').files[0]);

    try {
        await ResourcesAPI.upload(formData);
        showToast('Resource uploaded successfully!', 'success');
        closeModal();
        loadAdminResources();
        loadAdminDashboard();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function deleteResource(id) {
    if (!confirm('Delete this resource?')) return;
    try {
        await ResourcesAPI.delete(id);
        showToast('Resource deleted', 'info');
        loadAdminResources();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ---- Admin Students Tab ----
async function loadAdminStudents() {
    const container = document.getElementById('adminTabStudents');
    container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

    try {
        const data = await AdminAPI.getUsers();

        container.innerHTML = `
            <h3 style="font-size:1rem; margin-bottom:1rem">All Students (${data.users.length})</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Joined</th></tr></thead>
                    <tbody>
                        ${data.users.map(u => `
                            <tr>
                                <td><strong>${escapeHtml(u.name)}</strong></td>
                                <td>${escapeHtml(u.email)}</td>
                                <td>${formatDate(u.created_at)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (error) {
        container.innerHTML = `<div class="empty-state"><p>Error: ${error.message}</p></div>`;
    }
}

// ---- Admin Recent Activity Tab ----
async function loadAdminRecent() {
    const container = document.getElementById('adminTabRecent');

    if (window._adminRecentRegistrations) {
        const regs = window._adminRecentRegistrations;
        container.innerHTML = `
            <h3 style="font-size:1rem; margin-bottom:1rem">Recent Registrations</h3>
            ${regs.length === 0 ? '<p style="color:var(--text-muted)">No recent activity</p>' : `
            <div class="table-container">
                <table class="data-table">
                    <thead><tr><th>Student</th><th>Event</th><th>Date</th></tr></thead>
                    <tbody>
                        ${regs.map(r => `
                            <tr>
                                <td><strong>${escapeHtml(r.student_name)}</strong></td>
                                <td>${escapeHtml(r.event_title)}</td>
                                <td>${formatDate(r.registered_at)}</td>
                            </tr>`).join('')}
                    </tbody>
                </table>
            </div>`}`;
    } else {
        container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        try {
            const data = await AdminAPI.getStats();
            window._adminRecentRegistrations = data.recentRegistrations;
            loadAdminRecent();
        } catch (error) {
            container.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    }
}
