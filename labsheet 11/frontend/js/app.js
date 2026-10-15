// ============================================
// App Module - Router, Navigation, Global Handlers
// ============================================

// ---- Client-side Router ----
function navigateTo(page, param = '') {
    const main = document.getElementById('mainContent');

    // Close mobile nav
    document.getElementById('navLinks').classList.remove('show');
    document.getElementById('navDropdown')?.classList.remove('show');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update active nav link
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
    });

    // Route to page
    switch(page) {
        case 'home':
            main.innerHTML = renderHomePage();
            break;
        case 'events':
            currentEventsPage = 1;
            currentCategory = param || '';
            main.innerHTML = renderEventsPage(currentCategory);
            loadEvents();
            break;
        case 'event-detail':
            renderEventDetailPage(param);
            return; // handled async internally
        case 'resources':
            currentResourcesPage = 1;
            main.innerHTML = renderResourcesPage();
            loadResources();
            break;
        case 'my-events':
            if (!isLoggedIn()) { navigateTo('login'); return; }
            main.innerHTML = renderMyEventsPage();
            loadMyEvents();
            break;
        case 'admin':
            if (!isCurrentUserAdmin()) { navigateTo('home'); return; }
            main.innerHTML = renderAdminPage();
            loadAdminDashboard();
            break;
        case 'login':
            if (isLoggedIn()) { navigateTo('home'); return; }
            main.innerHTML = renderLoginPage();
            break;
        case 'register':
            if (isLoggedIn()) { navigateTo('home'); return; }
            main.innerHTML = renderRegisterPage();
            break;
        case 'profile':
            if (!isLoggedIn()) { navigateTo('login'); return; }
            main.innerHTML = renderProfilePage();
            break;
        default:
            main.innerHTML = renderHomePage();
    }
}

// ---- Toast Notifications ----
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ---- Modal ----
function openModal(content) {
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('show');
    document.body.style.overflow = '';
}

// Close modal on overlay click
document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});

// ---- Navbar Scroll Effect ----
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ---- Mobile Nav Toggle ----
document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('show');
});

// ---- User Dropdown Toggle ----
document.getElementById('navUserBtn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('navDropdown').classList.toggle('show');
});

document.addEventListener('click', () => {
    document.getElementById('navDropdown')?.classList.remove('show');
});

// ---- Initialize App ----
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
    navigateTo('home');
});
