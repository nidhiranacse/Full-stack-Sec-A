// ============================================
// Pages Module - Renders all page content
// ============================================

// Helper: Category display config
const CATEGORY_CONFIG = {
    workshop: { label: 'Workshop', icon: 'fa-laptop-code', color: '#818cf8', bgColor: 'rgba(129,140,248,0.1)' },
    hackathon: { label: 'Hackathon', icon: 'fa-code', color: '#f472b6', bgColor: 'rgba(244,114,182,0.1)' },
    seminar: { label: 'Seminar', icon: 'fa-microphone', color: '#34d399', bgColor: 'rgba(52,211,153,0.1)' },
    placement: { label: 'Placement', icon: 'fa-briefcase', color: '#fbbf24', bgColor: 'rgba(251,191,36,0.1)' },
    cultural: { label: 'Cultural', icon: 'fa-music', color: '#f97316', bgColor: 'rgba(249,115,22,0.1)' },
    sports: { label: 'Sports', icon: 'fa-futbol', color: '#22d3ee', bgColor: 'rgba(34,211,238,0.1)' },
    other: { label: 'Other', icon: 'fa-star', color: '#94a3b8', bgColor: 'rgba(148,163,184,0.1)' }
};

const RESOURCE_ICONS = {
    notes: 'fa-file-alt',
    pyq: 'fa-file-signature',
    assignment: 'fa-tasks',
    reference: 'fa-bookmark',
    other: 'fa-file'
};

// Format date to readable form
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

// ============================
// HOME PAGE
// ============================
function renderHomePage() {
    return `
        <section class="hero">
            <div class="hero-content">
                <div class="hero-badge">
                    <i class="fas fa-bolt"></i>
                    Your Campus, Your Events
                </div>
                <h1>
                    Discover & Join<br>
                    <span class="gradient-text">Campus Events</span>
                </h1>
                <p>
                    Find workshops, hackathons, seminars, and placement drives happening on campus. 
                    Register in one click, download study resources, and never miss an opportunity.
                </p>
                <div class="hero-buttons">
                    <button class="btn btn-primary btn-lg" onclick="navigateTo('events')">
                        <i class="fas fa-calendar-alt"></i> Explore Events
                    </button>
                    <button class="btn btn-secondary btn-lg" onclick="navigateTo('resources')">
                        <i class="fas fa-book"></i> Study Resources
                    </button>
                </div>
                <div class="hero-stats">
                    <div class="hero-stat">
                        <div class="number" id="homeStatEvents">8+</div>
                        <div class="label">Active Events</div>
                    </div>
                    <div class="hero-stat">
                        <div class="number" id="homeStatStudents">4+</div>
                        <div class="label">Students</div>
                    </div>
                    <div class="hero-stat">
                        <div class="number" id="homeStatResources">5+</div>
                        <div class="label">Resources</div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">
                <h2>Why CampusConnect?</h2>
                <p>Everything a college student needs — in one place.</p>
            </div>
            <div class="feature-grid">
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(129,140,248,0.1); color: #818cf8;">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3>Event Discovery</h3>
                    <p>Browse all upcoming workshops, hackathons, seminars, and placement drives with real-time seat availability.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(52,211,153,0.1); color: #34d399;">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <h3>One-Click Registration</h3>
                    <p>Register or unregister from events instantly. Track all your registered events from your personal dashboard.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(251,191,36,0.1); color: #fbbf24;">
                        <i class="fas fa-download"></i>
                    </div>
                    <h3>Study Resources</h3>
                    <p>Download notes, previous year papers, assignments, and reference materials uploaded by the admin.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(244,114,182,0.1); color: #f472b6;">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3>Secure & Role-Based</h3>
                    <p>JWT authentication ensures your data is safe. Students and admins have separate access levels.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(34,211,238,0.1); color: #22d3ee;">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>Search & Filter</h3>
                    <p>Find exactly what you need with powerful search, category filters, and pagination across events and resources.</p>
                </div>
                <div class="feature-card fade-in">
                    <div class="feature-icon" style="background: rgba(249,115,22,0.1); color: #f97316;">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <h3>Admin Dashboard</h3>
                    <p>Admins get a dedicated panel with event management, resource uploads, student lists, and statistics.</p>
                </div>
            </div>
        </section>
    `;
}

// ============================
// EVENTS PAGE
// ============================
function renderEventsPage(filterCategory = '') {
    return `
        <div class="page-header fade-in">
            <h1><i class="fas fa-calendar-alt" style="color:var(--primary-light)"></i> Campus Events</h1>
            <p>Discover and register for upcoming events on campus.</p>
        </div>
        <div class="section" style="padding-top:1rem">
            <div class="category-pills" id="categoryPills">
                <button class="category-pill ${!filterCategory ? 'active' : ''}" onclick="filterEvents('all')">All Events</button>
                <button class="category-pill ${filterCategory === 'workshop' ? 'active' : ''}" onclick="filterEvents('workshop')"><i class="fas fa-laptop-code"></i> Workshops</button>
                <button class="category-pill ${filterCategory === 'hackathon' ? 'active' : ''}" onclick="filterEvents('hackathon')"><i class="fas fa-code"></i> Hackathons</button>
                <button class="category-pill ${filterCategory === 'seminar' ? 'active' : ''}" onclick="filterEvents('seminar')"><i class="fas fa-microphone"></i> Seminars</button>
                <button class="category-pill ${filterCategory === 'placement' ? 'active' : ''}" onclick="filterEvents('placement')"><i class="fas fa-briefcase"></i> Placements</button>
                <button class="category-pill ${filterCategory === 'cultural' ? 'active' : ''}" onclick="filterEvents('cultural')"><i class="fas fa-music"></i> Cultural</button>
                <button class="category-pill ${filterCategory === 'sports' ? 'active' : ''}" onclick="filterEvents('sports')"><i class="fas fa-futbol"></i> Sports</button>
            </div>
            <div class="filter-bar">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" class="form-control" id="eventSearch" placeholder="Search events..." onkeyup="debounceSearch(this.value)">
                </div>
                <select class="form-control" id="eventSort" onchange="loadEvents()" style="max-width:180px">
                    <option value="event_date">Sort by Date</option>
                    <option value="title">Sort by Name</option>
                    <option value="available_seats">Sort by Seats</option>
                </select>
            </div>
            <div id="eventsGrid" class="grid-3">
                <div class="loading"><div class="spinner"></div>Loading events...</div>
            </div>
            <div id="eventsPagination" class="pagination"></div>
        </div>
    `;
}

// Debounce for search
let searchTimeout;
function debounceSearch(value) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => loadEvents(), 350);
}

// Current state for events page
let currentEventsPage = 1;
let currentCategory = '';

function filterEvents(category) {
    currentCategory = category === 'all' ? '' : category;
    currentEventsPage = 1;

    // Update pills
    document.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
    event.target.closest('.category-pill').classList.add('active');

    loadEvents();
}

async function loadEvents() {
    const grid = document.getElementById('eventsGrid');
    const paginationEl = document.getElementById('eventsPagination');
    
    grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading events...</div>';

    const search = document.getElementById('eventSearch')?.value || '';
    const sort = document.getElementById('eventSort')?.value || 'event_date';

    try {
        const data = await EventsAPI.getAll({
            page: currentEventsPage,
            limit: 9,
            search,
            category: currentCategory,
            sort
        });

        if (data.events.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No events found</h3>
                    <p>Try changing your search or filter criteria.</p>
                </div>`;
            paginationEl.innerHTML = '';
            return;
        }

        grid.innerHTML = data.events.map(event => renderEventCard(event)).join('');

        // Pagination
        const { currentPage, totalPages } = data.pagination;
        if (totalPages > 1) {
            let paginationHTML = '';
            paginationHTML += `<button onclick="goToEventsPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToEventsPage(${i})">${i}</button>`;
            }
            paginationHTML += `<button onclick="goToEventsPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
            paginationEl.innerHTML = paginationHTML;
        } else {
            paginationEl.innerHTML = '';
        }
    } catch (error) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading events</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="loadEvents()"><i class="fas fa-redo"></i> Retry</button>
            </div>`;
    }
}

function goToEventsPage(page) {
    currentEventsPage = page;
    loadEvents();
    window.scrollTo({ top: 200, behavior: 'smooth' });
}

function renderEventCard(event) {
    const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
    const seatsPercent = ((event.total_seats - event.available_seats) / event.total_seats) * 100;
    let seatsClass = 'seats-available';
    if (event.available_seats === 0) seatsClass = 'seats-full';
    else if (event.available_seats < 10) seatsClass = 'seats-low';

    return `
        <div class="card fade-in" onclick="navigateTo('event-detail', '${event.id}')" style="cursor:pointer">
            <div class="card-image" style="background: linear-gradient(135deg, ${cat.bgColor}, var(--bg-card-hover))">
                <i class="fas ${cat.icon}"></i>
                <span class="card-badge badge-${event.category}">${cat.label}</span>
            </div>
            <div class="card-body">
                <h3>${escapeHtml(event.title)}</h3>
                <p>${escapeHtml(event.description || '')}</p>
                <div class="card-meta">
                    <div class="card-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.event_date)}</span>
                    </div>
                    <div class="card-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(event.event_time)}</span>
                    </div>
                    <div class="card-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(event.venue)}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <span class="${seatsClass} seats-info">
                    <i class="fas fa-chair"></i> ${event.available_seats}/${event.total_seats} seats
                </span>
                <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); navigateTo('event-detail', '${event.id}')">
                    View Details
                </button>
            </div>
        </div>
    `;
}

// ============================
// EVENT DETAIL PAGE
// ============================
async function renderEventDetailPage(eventId) {
    const main = document.getElementById('mainContent');
    main.innerHTML = `
        <div class="page-header fade-in">
            <button class="btn btn-secondary btn-sm" onclick="navigateTo('events')" style="margin-bottom:1rem">
                <i class="fas fa-arrow-left"></i> Back to Events
            </button>
        </div>
        <div class="section event-detail" style="padding-top:0">
            <div class="loading"><div class="spinner"></div>Loading event details...</div>
        </div>`;

    try {
        const { event } = await EventsAPI.getById(eventId);
        const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
        const seatsUsed = event.total_seats - event.available_seats;
        const seatsPercent = (seatsUsed / event.total_seats) * 100;
        let barColor = 'var(--success)';
        if (event.available_seats === 0) barColor = 'var(--danger)';
        else if (event.available_seats < 10) barColor = 'var(--warning)';

        let regButton = '';
        const user = getCurrentUser();
        if (user && user.role === 'student') {
            try {
                const { isRegistered } = await RegistrationsAPI.check(eventId);
                if (isRegistered) {
                    regButton = `<button class="btn btn-danger" id="regBtn" onclick="unregisterEvent(${eventId})"><i class="fas fa-times"></i> Unregister</button>`;
                } else if (event.available_seats > 0) {
                    regButton = `<button class="btn btn-success" id="regBtn" onclick="registerEvent(${eventId})"><i class="fas fa-check"></i> Register Now</button>`;
                } else {
                    regButton = `<button class="btn btn-secondary" disabled><i class="fas fa-ban"></i> Fully Booked</button>`;
                }
            } catch (e) {
                regButton = `<button class="btn btn-primary" onclick="navigateTo('login')"><i class="fas fa-sign-in-alt"></i> Login to Register</button>`;
            }
        } else if (!user) {
            regButton = `<button class="btn btn-primary" onclick="navigateTo('login')"><i class="fas fa-sign-in-alt"></i> Login to Register</button>`;
        }

        const detailSection = main.querySelector('.section.event-detail');
        detailSection.innerHTML = `
            <div class="event-detail-header fade-in">
                <span class="card-badge badge-${event.category}" style="position:static; display:inline-flex; margin-bottom:0.75rem">
                    <i class="fas ${cat.icon}" style="margin-right:4px"></i> ${cat.label}
                </span>
                <h1>${escapeHtml(event.title)}</h1>
                <div class="event-detail-meta">
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.event_date)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(event.event_time)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${escapeHtml(event.venue)}</span>
                    </div>
                </div>
            </div>

            <div class="event-detail-body fade-in">
                <h2>About This Event</h2>
                <p>${escapeHtml(event.description || 'No description provided.')}</p>
                
                <div class="seats-bar">
                    <div class="seats-bar-label">
                        <span style="color:var(--text-secondary)"><i class="fas fa-users"></i> ${seatsUsed} registered</span>
                        <span style="color:${barColor}; font-weight:600">${event.available_seats} seats left</span>
                    </div>
                    <div class="seats-bar-track">
                        <div class="seats-bar-fill" style="width:${seatsPercent}%; background:${barColor}"></div>
                    </div>
                </div>

                <div class="event-actions">
                    ${regButton}
                    <button class="btn btn-secondary" onclick="navigateTo('events')">
                        <i class="fas fa-arrow-left"></i> All Events
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        const detailSection = main.querySelector('.section.event-detail');
        detailSection.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Event not found</h3>
                <p>${error.message}</p>
                <button class="btn btn-secondary" onclick="navigateTo('events')"><i class="fas fa-arrow-left"></i> Back to Events</button>
            </div>`;
    }
}

// Register for event
async function registerEvent(eventId) {
    const btn = document.getElementById('regBtn');
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div>';

    try {
        await RegistrationsAPI.register(eventId);
        showToast('Successfully registered for the event!', 'success');
        renderEventDetailPage(eventId); // Re-render to update UI
    } catch (error) {
        showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Register Now';
    }
}

// Unregister from event
async function unregisterEvent(eventId) {
    if (!confirm('Are you sure you want to unregister from this event?')) return;

    const btn = document.getElementById('regBtn');
    if (!btn) return;

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div>';

    try {
        await RegistrationsAPI.unregister(eventId);
        showToast('Successfully unregistered from the event.', 'info');
        renderEventDetailPage(eventId);
    } catch (error) {
        showToast(error.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-times"></i> Unregister';
    }
}

// ============================
// MY EVENTS PAGE
// ============================
function renderMyEventsPage() {
    return `
        <div class="page-header fade-in">
            <h1><i class="fas fa-ticket-alt" style="color:var(--primary-light)"></i> My Registered Events</h1>
            <p>Events you've registered for are shown below.</p>
        </div>
        <div class="section" style="padding-top:1rem">
            <div id="myEventsList">
                <div class="loading"><div class="spinner"></div>Loading your events...</div>
            </div>
        </div>
    `;
}

async function loadMyEvents() {
    const container = document.getElementById('myEventsList');
    try {
        const data = await RegistrationsAPI.myEvents();
        
        if (data.events.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>No registered events</h3>
                    <p>You haven't registered for any events yet. Explore campus events and join one!</p>
                    <button class="btn btn-primary" onclick="navigateTo('events')"><i class="fas fa-calendar-alt"></i> Browse Events</button>
                </div>`;
            return;
        }

        container.innerHTML = '<div class="grid-2">' + data.events.map(event => {
            const cat = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.other;
            return `
                <div class="reg-card fade-in">
                    <div class="reg-card-icon" style="background:${cat.bgColor}; color:${cat.color}">
                        <i class="fas ${cat.icon}"></i>
                    </div>
                    <div class="reg-card-info">
                        <h3>${escapeHtml(event.title)}</h3>
                        <p><i class="fas fa-calendar"></i> ${formatDate(event.event_date)} at ${formatTime(event.event_time)}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(event.venue)}</p>
                    </div>
                    <div style="display:flex; gap:0.5rem; flex-shrink:0">
                        <button class="btn btn-sm btn-secondary" onclick="navigateTo('event-detail', '${event.id}')"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="unregisterFromMyEvents(${event.id})"><i class="fas fa-times"></i></button>
                    </div>
                </div>`;
        }).join('') + '</div>';
    } catch (error) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading events</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

async function unregisterFromMyEvents(eventId) {
    if (!confirm('Unregister from this event?')) return;
    try {
        await RegistrationsAPI.unregister(eventId);
        showToast('Unregistered successfully', 'info');
        loadMyEvents();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ============================
// RESOURCES PAGE
// ============================
function renderResourcesPage() {
    return `
        <div class="page-header fade-in">
            <h1><i class="fas fa-book" style="color:var(--primary-light)"></i> Study Resources</h1>
            <p>Download notes, previous year papers, and study materials.</p>
        </div>
        <div class="section" style="padding-top:1rem">
            <div class="filter-bar">
                <div class="search-input-wrapper">
                    <i class="fas fa-search"></i>
                    <input type="text" class="form-control" id="resourceSearch" placeholder="Search resources..." onkeyup="debounceResourceSearch()">
                </div>
                <select class="form-control" id="resourceCategory" onchange="loadResources()" style="max-width:180px">
                    <option value="all">All Types</option>
                    <option value="notes">Notes</option>
                    <option value="pyq">Previous Year Papers</option>
                    <option value="assignment">Assignments</option>
                    <option value="reference">References</option>
                </select>
            </div>
            <div id="resourcesGrid" class="grid-3">
                <div class="loading"><div class="spinner"></div>Loading resources...</div>
            </div>
            <div id="resourcesPagination" class="pagination"></div>
        </div>
    `;
}

let resourceSearchTimeout;
function debounceResourceSearch() {
    clearTimeout(resourceSearchTimeout);
    resourceSearchTimeout = setTimeout(() => loadResources(), 350);
}

let currentResourcesPage = 1;

async function loadResources() {
    const grid = document.getElementById('resourcesGrid');
    const paginationEl = document.getElementById('resourcesPagination');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading resources...</div>';

    const search = document.getElementById('resourceSearch')?.value || '';
    const category = document.getElementById('resourceCategory')?.value || 'all';

    try {
        const data = await ResourcesAPI.getAll({
            page: currentResourcesPage,
            limit: 12,
            search,
            category
        });

        if (data.resources.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1">
                    <i class="fas fa-folder-open"></i>
                    <h3>No resources found</h3>
                    <p>No study materials match your search.</p>
                </div>`;
            paginationEl.innerHTML = '';
            return;
        }

        grid.innerHTML = data.resources.map(resource => {
            const icon = RESOURCE_ICONS[resource.category] || 'fa-file';
            return `
                <div class="resource-card fade-in">
                    <div class="resource-icon ${resource.category}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <h3>${escapeHtml(resource.title)}</h3>
                    ${resource.subject ? `<div class="subject">${escapeHtml(resource.subject)}</div>` : ''}
                    <p>${escapeHtml(resource.description || '')}</p>
                    <div class="card-actions">
                        <a href="${ResourcesAPI.getDownloadUrl(resource.id)}" class="btn btn-sm btn-primary" target="_blank">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                </div>`;
        }).join('');

        // Pagination
        const { currentPage, totalPages } = data.pagination;
        if (totalPages > 1) {
            let html = '';
            html += `<button onclick="goToResourcesPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToResourcesPage(${i})">${i}</button>`;
            }
            html += `<button onclick="goToResourcesPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
            paginationEl.innerHTML = html;
        } else {
            paginationEl.innerHTML = '';
        }
    } catch (error) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading resources</h3>
                <p>${error.message}</p>
            </div>`;
    }
}

function goToResourcesPage(page) {
    currentResourcesPage = page;
    loadResources();
}

// ============================
// LOGIN PAGE
// ============================
function renderLoginPage() {
    return `
        <div class="auth-page">
            <div class="auth-card fade-in">
                <h2>Welcome Back</h2>
                <p class="subtitle">Login to your CampusConnect account</p>
                <form id="loginForm" onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">Email Address</label>
                        <input type="email" id="loginEmail" class="form-control" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Password</label>
                        <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
                        <i class="fas fa-sign-in-alt"></i> Login
                    </button>
                </form>
                <div class="auth-switch">
                    Don't have an account? <a onclick="navigateTo('register')">Create one</a>
                </div>
                <div class="auth-divider">— Demo Credentials —</div>
                <div style="font-size:0.8rem; color:var(--text-muted); text-align:center; line-height:1.8">
                    <strong>Admin:</strong> admin@campus.com / admin123<br>
                    <strong>Student:</strong> aarav@student.com / student123
                </div>
            </div>
        </div>
    `;
}

// ============================
// REGISTER PAGE
// ============================
function renderRegisterPage() {
    return `
        <div class="auth-page">
            <div class="auth-card fade-in">
                <h2>Create Account</h2>
                <p class="subtitle">Join CampusConnect as a student</p>
                <form id="registerForm" onsubmit="handleRegister(event)">
                    <div class="form-group">
                        <label for="regName">Full Name</label>
                        <input type="text" id="regName" class="form-control" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label for="regEmail">Email Address</label>
                        <input type="email" id="regEmail" class="form-control" placeholder="you@example.com" required>
                    </div>
                    <div class="form-group">
                        <label for="regPassword">Password</label>
                        <input type="password" id="regPassword" class="form-control" placeholder="Min 6 characters" required>
                    </div>
                    <div class="form-group">
                        <label for="regConfirmPassword">Confirm Password</label>
                        <input type="password" id="regConfirmPassword" class="form-control" placeholder="Re-enter password" required>
                    </div>
                    <button type="submit" class="btn btn-primary btn-lg" style="width:100%">
                        <i class="fas fa-user-plus"></i> Create Account
                    </button>
                </form>
                <div class="auth-switch">
                    Already have an account? <a onclick="navigateTo('login')">Login</a>
                </div>
            </div>
        </div>
    `;
}

// ============================
// PROFILE PAGE
// ============================
function renderProfilePage() {
    const user = getCurrentUser();
    if (!user) return renderLoginPage();

    return `
        <div class="page-header fade-in">
            <h1><i class="fas fa-user" style="color:var(--primary-light)"></i> My Profile</h1>
        </div>
        <div class="section" style="padding-top:1rem">
            <div class="profile-card fade-in">
                <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <h2>${escapeHtml(user.name)}</h2>
                <p class="email">${escapeHtml(user.email)}</p>
                <span class="role-badge role-${user.role}">${user.role}</span>
                <div style="margin-top:2rem">
                    <button class="btn btn-danger" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================
// UTILITY FUNCTIONS
// ============================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
