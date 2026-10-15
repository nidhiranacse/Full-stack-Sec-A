const rowsElement = document.querySelector('#student-rows');
const emptyState = document.querySelector('#empty-state');
const emptyTitle = document.querySelector('#empty-title');
const emptyCopy = document.querySelector('#empty-copy');
const searchInput = document.querySelector('#search-input');
const minAgeInput = document.querySelector('#min-age-input');
const createForm = document.querySelector('#create-form');
const formError = document.querySelector('#form-error');
const connectionState = document.querySelector('#connection-state');
const toast = document.querySelector('#toast');
const studentDialog = document.querySelector('#student-dialog');
const studentDetail = document.querySelector('#student-detail');

let allStudents = [];
let ageFilteredStudents = [];
let toastTimer;

document.querySelector('#today-label').textContent = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date());

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2800);
}

function setConnection(isConnected) {
  connectionState.textContent = isConnected ? 'API connected' : 'API unavailable';
  connectionState.parentElement.classList.toggle('connected', isConnected);
  connectionState.parentElement.classList.toggle('disconnected', !isConnected);
}

function renderStudents() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const visibleStudents = ageFilteredStudents.filter((student) =>
    `${student.name} ${student.email}`.toLowerCase().includes(searchTerm));

  document.querySelector('#total-count').textContent = allStudents.length;
  const averageAge = allStudents.length
    ? Math.round(allStudents.reduce((total, student) => total + student.age, 0) / allStudents.length)
    : '--';
  document.querySelector('#average-age').textContent = averageAge;
  document.querySelector('#shown-count').textContent = visibleStudents.length;
  document.querySelector('#result-count').textContent = `Showing ${visibleStudents.length} of ${allStudents.length}`;

  rowsElement.innerHTML = visibleStudents.map((student) => `
    <tr>
      <td><div class="student-name"><span class="avatar" aria-hidden="true">${escapeHtml(initials(student.name))}</span><div><strong>${escapeHtml(student.name)}</strong><small>Student #${student.id}</small></div></div></td>
      <td>${escapeHtml(student.email)}</td>
      <td><span class="age-value">${student.age}</span></td>
      <td><div class="row-actions"><button class="view-action" type="button" data-action="view" data-id="${student.id}">View</button><button class="delete-action" type="button" data-action="delete" data-id="${student.id}">Delete</button></div></td>
    </tr>`).join('');

  const isEmpty = visibleStudents.length === 0;
  emptyState.hidden = !isEmpty;
  if (isEmpty && allStudents.length > 0) {
    emptyTitle.textContent = 'No matching students';
    emptyCopy.textContent = 'Try another name, email, or minimum age.';
  } else {
    emptyTitle.textContent = 'No student records yet';
    emptyCopy.textContent = 'Add a student to start building the campus directory.';
  }
}

async function loadStudents() {
  try {
    const minAge = minAgeInput.value.trim();
    const query = minAge ? `?minAge=${encodeURIComponent(minAge)}` : '';
    const [allResponse, filteredResponse] = await Promise.all([
      fetch('/students'),
      fetch(`/students${query}`),
    ]);
    if (!allResponse.ok || !filteredResponse.ok) throw new Error('Unable to load student records.');
    allStudents = await allResponse.json();
    ageFilteredStudents = await filteredResponse.json();
    setConnection(true);
    renderStudents();
  } catch (error) {
    setConnection(false);
    rowsElement.innerHTML = '';
    emptyState.hidden = false;
    emptyTitle.textContent = 'Could not connect to the API';
    emptyCopy.textContent = 'Check that the server is running, then refresh the records.';
    document.querySelector('#total-count').textContent = '--';
    document.querySelector('#average-age').textContent = '--';
    document.querySelector('#shown-count').textContent = '--';
    document.querySelector('#result-count').textContent = 'Connection error';
  }
}

function openStudentDetails(student) {
  studentDetail.innerHTML = `
    <div class="detail-hero"><span class="avatar" aria-hidden="true">${escapeHtml(initials(student.name))}</span><div><h2 id="dialog-title">${escapeHtml(student.name)}</h2><p>Student record #${student.id}</p></div></div>
    <div class="detail-grid">
      <div class="detail-item"><span>EMAIL ADDRESS</span><strong>${escapeHtml(student.email)}</strong></div>
      <div class="detail-item"><span>AGE</span><strong>${student.age} years</strong></div>
    </div>`;
  studentDialog.showModal();
}

createForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.hidden = true;

  const formData = new FormData(createForm);
  const student = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    age: Number(formData.get('age')),
  };

  try {
    const response = await fetch('/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Unable to create student record.');
    createForm.reset();
    minAgeInput.value = '';
    await loadStudents();
    showToast(`Student record #${result.id} created.`);
  } catch (error) {
    formError.textContent = error.message === 'Email already exists'
      ? 'That email address already has a student record.'
      : error.message === 'Invalid input'
        ? 'Enter a name, a valid email, and a positive whole-number age.'
        : error.message;
    formError.hidden = false;
  }
});

rowsElement.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const studentId = Number(button.dataset.id);
  if (button.dataset.action === 'view') {
    try {
      const response = await fetch(`/students/${studentId}`);
      const student = await response.json();
      if (!response.ok) throw new Error(student.error || 'Unable to load student.');
      openStudentDetails(student);
    } catch (error) {
      showToast(error.message);
    }
    return;
  }

  const student = allStudents.find((record) => record.id === studentId);
  if (!student || !window.confirm(`Delete the record for ${student.name}?`)) return;

  try {
    const response = await fetch(`/students/${studentId}`, { method: 'DELETE' });
    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Unable to delete student record.');
    }
    await loadStudents();
    showToast(`Student record #${studentId} deleted.`);
  } catch (error) {
    showToast(error.message);
  }
});

searchInput.addEventListener('input', renderStudents);
minAgeInput.addEventListener('change', loadStudents);
document.querySelector('#refresh-button').addEventListener('click', loadStudents);
document.querySelector('.dialog-close').addEventListener('click', () => studentDialog.close());
studentDialog.addEventListener('click', (event) => {
  if (event.target === studentDialog) studentDialog.close();
});

loadStudents();