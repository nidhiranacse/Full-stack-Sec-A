// ============================================
// Auth Module - Login/Logout/Session Management
// ============================================

// Get current user from localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('cc_user');
    return userData ? JSON.parse(userData) : null;
}

// Get token
function getToken() {
    return localStorage.getItem('cc_token');
}

// Check if logged in
function isLoggedIn() {
    return !!getToken();
}

// Check if current user is admin
function isCurrentUserAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Save auth data
function saveAuth(token, user) {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(user));
    updateNavbar();
}

// Clear auth data
function clearAuth() {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    updateNavbar();
}

// Update navbar based on auth state
function updateNavbar() {
    const user = getCurrentUser();
    const navLogin = document.getElementById('navLogin');
    const navUser = document.getElementById('navUser');
    const navMyEvents = document.getElementById('navMyEvents');
    const navAdmin = document.getElementById('navAdmin');

    if (user) {
        navLogin.style.display = 'none';
        navUser.style.display = 'block';
        document.getElementById('navUserName').textContent = user.name.split(' ')[0];
        document.getElementById('navAvatar').textContent = user.name.charAt(0).toUpperCase();

        if (user.role === 'student') {
            navMyEvents.style.display = 'block';
            navAdmin.style.display = 'none';
        } else if (user.role === 'admin') {
            navMyEvents.style.display = 'none';
            navAdmin.style.display = 'block';
        }
    } else {
        navLogin.style.display = 'block';
        navUser.style.display = 'none';
        navMyEvents.style.display = 'none';
        navAdmin.style.display = 'none';
    }
}

// Logout
function logout() {
    clearAuth();
    showToast('Logged out successfully', 'info');
    navigateTo('home');
}

// Handle login form
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');

    if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Logging in...';

    try {
        const data = await AuthAPI.login(email, password);
        saveAuth(data.token, data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
        
        if (data.user.role === 'admin') {
            navigateTo('admin');
        } else {
            navigateTo('events');
        }
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
    }
}

// Handle register form
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const btn = e.target.querySelector('button[type="submit"]');

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    if (name.length < 2) {
        showToast('Name must be at least 2 characters', 'error');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;margin:0"></div> Creating account...';

    try {
        const data = await AuthAPI.register(name, email, password);
        saveAuth(data.token, data.user);
        showToast('Account created! Welcome to CampusConnect!', 'success');
        navigateTo('events');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
}
