/**
 * Practical B1: JWT Authentication API Client-Side Controller
 * Developed for Aaryan Verma • Full Stack Practical
 */

// Application State
const state = {
  token: localStorage.getItem('jwt_token') || '',
  username: localStorage.getItem('jwt_username') || '',
  timerInterval: null
};

// DOM Elements
const elements = {
  // Tabs
  tabs: document.querySelectorAll('.nav-tab'),
  tabPanels: document.querySelectorAll('.tab-panel'),

  // Session Banner
  sessionBanner: document.getElementById('session-banner'),
  sessionUsername: document.getElementById('session-username'),
  tokenTimer: document.getElementById('token-timer'),
  btnCopyToken: document.getElementById('btn-copy-token'),
  btnLogout: document.getElementById('btn-logout'),

  // Register
  formRegister: document.getElementById('form-register'),
  regUsername: document.getElementById('reg-username'),
  regPassword: document.getElementById('reg-password'),
  regPwMeter: document.getElementById('reg-pw-meter'),
  regPwHint: document.getElementById('reg-pw-hint'),
  btnSubmitReg: document.getElementById('btn-submit-register'),
  btnFillRegDemo: document.getElementById('btn-fill-reg-demo'),
  regStatusTag: document.getElementById('reg-status-tag'),
  regResponseJson: document.getElementById('reg-response-json'),

  // Login
  formLogin: document.getElementById('form-login'),
  loginUsername: document.getElementById('login-username'),
  loginPassword: document.getElementById('login-password'),
  btnSubmitLogin: document.getElementById('btn-submit-login'),
  btnFillLoginDemo: document.getElementById('btn-fill-login-demo'),
  loginStatusTag: document.getElementById('login-status-tag'),
  loginResponseJson: document.getElementById('login-response-json'),

  // Profile
  tokenInput: document.getElementById('token-input'),
  btnFetchProfileValid: document.getElementById('btn-fetch-profile-valid'),
  btnFetchProfileNone: document.getElementById('btn-fetch-profile-none'),
  btnFetchProfileFake: document.getElementById('btn-fetch-profile-fake'),
  decodedTokenView: document.getElementById('decoded-token-view'),
  tokenValidityBadge: document.getElementById('token-validity-badge'),
  profileStatusTag: document.getElementById('profile-status-tag'),
  profileHeaderSent: document.getElementById('profile-header-sent'),
  profileResponseJson: document.getElementById('profile-response-json'),

  // Automated Tester
  btnRunAllTests: document.getElementById('btn-run-all-tests'),
  testProgress: document.getElementById('test-progress'),
  testStatsText: document.getElementById('test-stats-text'),
  testStatsCounts: document.getElementById('test-stats-counts'),
  passedCount: document.getElementById('passed-count'),
  testsContainer: document.getElementById('tests-container'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// 12 Test Cases defined by Practical B1
const testCases = [
  {
    id: 1,
    name: 'Register: Missing Username',
    method: 'POST',
    endpoint: '/register',
    body: { password: 'password123' },
    expectedStatus: 400,
    expectedBody: { error: 'Invalid input' },
    desc: 'username missing should return 400 with { error: "Invalid input" }'
  },
  {
    id: 2,
    name: 'Register: Empty Username',
    method: 'POST',
    endpoint: '/register',
    body: { username: '   ', password: 'password123' },
    expectedStatus: 400,
    expectedBody: { error: 'Invalid input' },
    desc: 'empty/whitespace username should return 400 with { error: "Invalid input" }'
  },
  {
    id: 3,
    name: 'Register: Password < 6 chars',
    method: 'POST',
    endpoint: '/register',
    body: { username: 'testuser', password: '123' },
    expectedStatus: 400,
    expectedBody: { error: 'Invalid input' },
    desc: 'password shorter than 6 characters should return 400 with { error: "Invalid input" }'
  },
  {
    id: 4,
    name: 'Register: Missing Password',
    method: 'POST',
    endpoint: '/register',
    body: { username: 'testuser' },
    expectedStatus: 400,
    expectedBody: { error: 'Invalid input' },
    desc: 'missing password field should return 400 with { error: "Invalid input" }'
  },
  {
    id: 5,
    name: 'Register: Successful Creation',
    method: 'POST',
    endpoint: '/register',
    dynamicBody: () => ({ username: `auto_${Date.now()}`, password: 'secure_password_123' }),
    expectedStatus: 201,
    expectedBody: { message: 'User registered' },
    desc: 'valid username and password (>= 6 chars) should return 201 with { message: "User registered" }'
  },
  {
    id: 6,
    name: 'Register: Duplicate Username',
    method: 'POST',
    endpoint: '/register',
    setupDuplicate: true,
    expectedStatus: 409,
    expectedBody: { error: 'Username already exists' },
    desc: 'attempting to register existing username should return 409 with { error: "Username already exists" }'
  },
  {
    id: 7,
    name: 'Login: Unknown User',
    method: 'POST',
    endpoint: '/login',
    body: { username: 'nonexistent_user_9999', password: 'password123' },
    expectedStatus: 401,
    expectedBody: { error: 'Invalid credentials' },
    desc: 'unknown user should return 401 with { error: "Invalid credentials" }'
  },
  {
    id: 8,
    name: 'Login: Wrong Password',
    method: 'POST',
    endpoint: '/login',
    setupUserForWrongPass: true,
    expectedStatus: 401,
    expectedBody: { error: 'Invalid credentials' },
    desc: 'incorrect password should return 401 with { error: "Invalid credentials" }'
  },
  {
    id: 9,
    name: 'Login: Valid Credentials',
    method: 'POST',
    endpoint: '/login',
    setupUserForLogin: true,
    expectedStatus: 200,
    checkToken: true,
    desc: 'correct credentials should return 200 with { token: "<jwt>" } valid for 1 hour'
  },
  {
    id: 10,
    name: 'Profile: Missing Auth Header',
    method: 'GET',
    endpoint: '/profile',
    headers: {},
    expectedStatus: 401,
    expectedBody: { error: 'Unauthorized' },
    desc: 'missing Authorization header should return 401 with { error: "Unauthorized" }'
  },
  {
    id: 11,
    name: 'Profile: Malformed / Invalid Token',
    method: 'GET',
    endpoint: '/profile',
    headers: { Authorization: 'Bearer this.is.an.invalid.malformed.token' },
    expectedStatus: 401,
    expectedBody: { error: 'Unauthorized' },
    desc: 'malformed or tampered token signature should return 401 with { error: "Unauthorized" }'
  },
  {
    id: 12,
    name: 'Profile: Valid JWT Bearer Token',
    method: 'GET',
    endpoint: '/profile',
    useActiveToken: true,
    expectedStatus: 200,
    checkUsername: true,
    desc: 'valid Authorization: Bearer <token> should return 200 with { username: "<username>" }'
  }
];

// Helper: Show Toast Notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper: Format JSON syntax in pre code
function displayFormattedJSON(element, data) {
  element.textContent = JSON.stringify(data, null, 2);
}

// Helper: Decode JWT Token safely in browser
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Update Token Timer & Decode View
function updateTokenInspection() {
  const token = elements.tokenInput.value.trim();
  if (!token) {
    elements.decodedTokenView.innerHTML = '<p class="empty-state">Log in or paste a valid JWT above to inspect payload fields.</p>';
    elements.tokenValidityBadge.textContent = 'No Token';
    elements.tokenValidityBadge.className = 'badge badge-sky-sm';
    return;
  }

  const payload = parseJwt(token);
  if (!payload) {
    elements.decodedTokenView.innerHTML = '<p class="empty-state text-error">⚠️ Invalid / Malformed JWT structure.</p>';
    elements.tokenValidityBadge.textContent = 'Malformed';
    elements.tokenValidityBadge.className = 'badge badge-cream';
    return;
  }

  // Display payload safely
  elements.decodedTokenView.innerHTML = `<pre><code>${JSON.stringify(payload, null, 2)}</code></pre>`;
  
  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000);
    const isExpired = Date.now() >= payload.exp * 1000;
    if (isExpired) {
      elements.tokenValidityBadge.textContent = 'Expired';
      elements.tokenValidityBadge.className = 'badge badge-cream';
    } else {
      elements.tokenValidityBadge.textContent = 'Active (1h)';
      elements.tokenValidityBadge.className = 'badge badge-sky';
    }
  } else {
    elements.tokenValidityBadge.textContent = 'Valid Payload';
    elements.tokenValidityBadge.className = 'badge badge-sky';
  }
}

// Session Timer Loop
function startSessionTimer(expTimestamp) {
  if (state.timerInterval) clearInterval(state.timerInterval);

  function tick() {
    const remaining = Math.max(0, Math.floor(expTimestamp - Date.now() / 1000));
    if (remaining <= 0) {
      elements.tokenTimer.textContent = 'Expired';
      clearInterval(state.timerInterval);
      showToast('Session token has expired. Please log in again.', 'error');
      return;
    }
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    elements.tokenTimer.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  }

  tick();
  state.timerInterval = setInterval(tick, 1000);
}

// Set Active Session
function setSession(username, token) {
  state.username = username;
  state.token = token;
  localStorage.setItem('jwt_token', token);
  localStorage.setItem('jwt_username', username);

  elements.sessionUsername.textContent = username;
  elements.sessionBanner.classList.remove('hidden');
  elements.tokenInput.value = token;

  const payload = parseJwt(token);
  if (payload && payload.exp) {
    startSessionTimer(payload.exp);
  }

  updateTokenInspection();
}

// Clear Session
function clearSession() {
  state.username = '';
  state.token = '';
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('jwt_username');

  elements.sessionBanner.classList.add('hidden');
  elements.tokenInput.value = '';
  if (state.timerInterval) clearInterval(state.timerInterval);
  updateTokenInspection();
  showToast('Logged out successfully.', 'info');
}

// Tab Switching
elements.tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    elements.tabs.forEach((t) => t.classList.remove('active'));
    elements.tabPanels.forEach((p) => p.classList.remove('active'));

    tab.classList.add('active');
    const targetId = tab.getAttribute('data-tab');
    document.getElementById(targetId).classList.add('active');
  });
});

// Password Show/Hide Toggle
document.querySelectorAll('.btn-toggle-pw').forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🔒';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
});

// Password Strength Meter
elements.regPassword.addEventListener('input', (e) => {
  const len = e.target.value.length;
  if (len === 0) {
    elements.regPwMeter.style.width = '0%';
    elements.regPwMeter.classList.remove('valid');
    elements.regPwHint.textContent = 'Min 6 characters required';
    elements.regPwHint.style.color = 'var(--text-light)';
  } else if (len < 6) {
    elements.regPwMeter.style.width = `${(len / 6) * 60}%`;
    elements.regPwMeter.classList.remove('valid');
    elements.regPwHint.textContent = `Too short (${len}/6 characters)`;
    elements.regPwHint.style.color = '#EF4444';
  } else {
    elements.regPwMeter.style.width = '100%';
    elements.regPwMeter.classList.add('valid');
    elements.regPwHint.textContent = 'Password meets minimum length (>= 6 chars)';
    elements.regPwHint.style.color = '#10B981';
  }
});

// Form: Register
elements.formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = elements.regUsername.value;
  const password = elements.regPassword.value;

  elements.btnSubmitReg.disabled = true;
  elements.regStatusTag.textContent = 'Sending...';
  elements.regStatusTag.className = 'status-tag';

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    elements.regStatusTag.textContent = `${res.status} ${res.statusText || ''}`;
    elements.regStatusTag.className = `status-tag status-${res.status}`;
    displayFormattedJSON(elements.regResponseJson, data);

    if (res.status === 201) {
      showToast('Registration successful! Please login.', 'success');
      // Pre-fill login credentials for seamless experience
      elements.loginUsername.value = username;
      elements.loginPassword.value = password;
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (err) {
    elements.regStatusTag.textContent = 'Network Error';
    displayFormattedJSON(elements.regResponseJson, { error: err.message });
    showToast('Failed to connect to server', 'error');
  } finally {
    elements.btnSubmitReg.disabled = false;
  }
});

// Form: Login
elements.formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = elements.loginUsername.value;
  const password = elements.loginPassword.value;

  elements.btnSubmitLogin.disabled = true;
  elements.loginStatusTag.textContent = 'Authenticating...';
  elements.loginStatusTag.className = 'status-tag';

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    elements.loginStatusTag.textContent = `${res.status} ${res.statusText || ''}`;
    elements.loginStatusTag.className = `status-tag status-${res.status}`;
    displayFormattedJSON(elements.loginResponseJson, data);

    if (res.status === 200 && data.token) {
      setSession(username, data.token);
      showToast(`Welcome back, ${username}! JWT saved.`, 'success');
    } else {
      showToast(data.error || 'Login failed', 'error');
    }
  } catch (err) {
    elements.loginStatusTag.textContent = 'Network Error';
    displayFormattedJSON(elements.loginResponseJson, { error: err.message });
    showToast('Failed to connect to server', 'error');
  } finally {
    elements.btnSubmitLogin.disabled = false;
  }
});

// Demo Data Fill Buttons
elements.btnFillRegDemo.addEventListener('click', () => {
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  elements.regUsername.value = `aaryan_${randomSuffix}`;
  elements.regPassword.value = 'mypassword123';
  elements.regPassword.dispatchEvent(new Event('input'));
  showToast('Generated sample credentials in register form', 'info');
});

elements.btnFillLoginDemo.addEventListener('click', () => {
  if (elements.regUsername.value) {
    elements.loginUsername.value = elements.regUsername.value;
    elements.loginPassword.value = elements.regPassword.value;
    showToast('Copied credentials from registration form', 'info');
  } else {
    showToast('Register an account or type credentials first.', 'info');
  }
});

// Copy Token Button
elements.btnCopyToken.addEventListener('click', () => {
  if (!state.token) return;
  navigator.clipboard.writeText(state.token).then(() => {
    showToast('JWT Token copied to clipboard!', 'success');
  });
});

// Logout Button
elements.btnLogout.addEventListener('click', clearSession);

// Profile: Fetch Request Dispatcher
async function fetchProfileRequest(authHeaderValue) {
  elements.profileStatusTag.textContent = 'Sending...';
  elements.profileStatusTag.className = 'status-tag';
  elements.profileHeaderSent.textContent = authHeaderValue || 'None (Header omitted)';

  const headers = {};
  if (authHeaderValue) {
    headers['Authorization'] = authHeaderValue;
  }

  try {
    const res = await fetch('/profile', { headers });
    const data = await res.json();

    elements.profileStatusTag.textContent = `${res.status} ${res.statusText || ''}`;
    elements.profileStatusTag.className = `status-tag status-${res.status}`;
    displayFormattedJSON(elements.profileResponseJson, data);

    if (res.status === 200) {
      showToast(`Authenticated as: ${data.username}`, 'success');
    } else {
      showToast(`Profile access rejected: ${data.error}`, 'error');
    }
  } catch (err) {
    elements.profileStatusTag.textContent = 'Network Error';
    displayFormattedJSON(elements.profileResponseJson, { error: err.message });
    showToast('Error requesting profile', 'error');
  }
}

elements.btnFetchProfileValid.addEventListener('click', () => {
  const token = elements.tokenInput.value.trim();
  if (!token) {
    showToast('Please log in first or enter a JWT token.', 'error');
    return;
  }
  fetchProfileRequest(`Bearer ${token}`);
});

elements.btnFetchProfileNone.addEventListener('click', () => {
  fetchProfileRequest(null);
});

elements.btnFetchProfileFake.addEventListener('click', () => {
  fetchProfileRequest('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.tampered_signature_xyz');
});

elements.tokenInput.addEventListener('input', updateTokenInspection);

// cURL Copy Buttons
document.querySelectorAll('.btn-copy-cmd').forEach((btn) => {
  btn.addEventListener('click', () => {
    let cmd = btn.getAttribute('data-cmd');
    if (cmd.includes('<YOUR_TOKEN>')) {
      cmd = cmd.replace('<YOUR_TOKEN>', state.token || 'PASTE_TOKEN_HERE');
    }
    navigator.clipboard.writeText(cmd).then(() => {
      showToast('cURL command copied to clipboard!', 'success');
    });
  });
});

// Render Automated Test Cards
function renderTestCards() {
  elements.testsContainer.innerHTML = '';
  testCases.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'test-card';
    card.id = `test-card-${t.id}`;
    card.innerHTML = `
      <div>
        <div class="test-header">
          <span class="test-num">TEST #${t.id}</span>
          <span class="test-result-indicator" id="test-indicator-${t.id}">Pending</span>
        </div>
        <h4 class="test-name">${t.name}</h4>
        <p class="test-desc">${t.desc}</p>
      </div>
      <div class="test-badges">
        <span class="endpoint-pill method-${t.method.toLowerCase()}">${t.method} ${t.endpoint}</span>
        <span class="status-badge status-${t.expectedStatus}">Expected: ${t.expectedStatus}</span>
      </div>
    `;
    elements.testsContainer.appendChild(card);
  });
}

// Run All 12 Automated Tests
async function runAllAutomatedTests() {
  elements.btnRunAllTests.disabled = true;
  elements.testStatsCounts.classList.remove('hidden');
  let passedTotal = 0;

  // Dedicated test username for consistency
  const uniqueTestUser = `test_runner_${Date.now()}`;
  const testPassword = 'validPassword123';
  let activeTestToken = '';

  for (let i = 0; i < testCases.length; i++) {
    const t = testCases[i];
    const card = document.getElementById(`test-card-${t.id}`);
    const indicator = document.getElementById(`test-indicator-${t.id}`);
    indicator.textContent = 'Running...';
    indicator.className = 'test-result-indicator';

    let requestBody = t.body;
    let requestHeaders = { 'Content-Type': 'application/json' };

    // Dynamic setups
    if (t.dynamicBody) {
      requestBody = t.dynamicBody();
    } else if (t.setupDuplicate) {
      // Create user first
      await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'duplicate_target', password: 'password123' })
      });
      requestBody = { username: 'duplicate_target', password: 'newpassword123' };
    } else if (t.setupUserForWrongPass) {
      await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uniqueTestUser, password: testPassword })
      });
      requestBody = { username: uniqueTestUser, password: 'WRONG_PASSWORD_XYZ' };
    } else if (t.setupUserForLogin) {
      requestBody = { username: uniqueTestUser, password: testPassword };
    } else if (t.useActiveToken) {
      requestHeaders = { Authorization: `Bearer ${activeTestToken}` };
    }

    if (t.headers) {
      requestHeaders = { ...requestHeaders, ...t.headers };
    }

    try {
      const fetchOpts = {
        method: t.method,
        headers: requestHeaders
      };
      if (t.method === 'POST') {
        fetchOpts.body = JSON.stringify(requestBody);
      }

      const res = await fetch(t.endpoint, fetchOpts);
      const data = await res.json();

      let isSuccess = res.status === t.expectedStatus;

      if (t.expectedBody) {
        for (const [key, val] of Object.entries(t.expectedBody)) {
          if (data[key] !== val) isSuccess = false;
        }
      }

      if (t.checkToken) {
        if (!data.token || typeof data.token !== 'string') isSuccess = false;
        else activeTestToken = data.token;
      }

      if (t.checkUsername) {
        if (data.username !== uniqueTestUser) isSuccess = false;
      }

      if (isSuccess) {
        passedTotal++;
        card.className = 'test-card passed';
        indicator.textContent = 'PASS';
        indicator.className = 'test-result-indicator pass';
      } else {
        card.className = 'test-card failed';
        indicator.textContent = `FAIL (${res.status})`;
        indicator.className = 'test-result-indicator fail';
      }
    } catch (err) {
      card.className = 'test-card failed';
      indicator.textContent = 'ERR';
      indicator.className = 'test-result-indicator fail';
    }

    const progressPercent = Math.round(((i + 1) / testCases.length) * 100);
    elements.testProgress.style.width = `${progressPercent}%`;
    elements.passedCount.textContent = passedTotal;

    // Small delay for smooth visual test step progression
    await new Promise((r) => setTimeout(r, 80));
  }

  elements.testStatsText.textContent =
    passedTotal === 12
      ? '🎉 All 12/12 edge cases passed with complete academic compliance!'
      : `⚠️ ${12 - passedTotal} tests failed.`;
  elements.btnRunAllTests.disabled = false;
  showToast(`Test suite finished: ${passedTotal}/12 tests passed!`, passedTotal === 12 ? 'success' : 'error');
}

elements.btnRunAllTests.addEventListener('click', runAllAutomatedTests);

// Initialization
function init() {
  renderTestCards();

  // If already logged in from previous session, restore it
  if (state.token && state.username) {
    setSession(state.username, state.token);
  } else {
    updateTokenInspection();
  }
}

init();
