document.getElementById('createStudentForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const studentId = document.getElementById('studentId').value;
  const messageEl = document.getElementById('createMessage');
  messageEl.textContent = '';

  try {
    const res = await fetch('/auth/createStudent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, studentId }),
    });

    const data = await res.json();

    if (res.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = data.message || 'Student created successfully';
      setTimeout(() => { window.location.href = '/adminDashboard.html'; }, 1000);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = data.message || data.error || 'Failed to create student';
    }
  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = err.message || 'Network error';
  }
});

// Handle password change
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('studentEmailChange').value;
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const messageEl = document.getElementById('changeMessage');
  messageEl.textContent = '';

  if (newPassword !== confirmPassword) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'New passwords do not match';
    return;
  }

  try {
    const res = await fetch('/auth/changePassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        currentPassword, 
        newPassword,
        userType: 'student'
      }),
    });

    const data = await res.json();

    if (res.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = data.message || 'Password changed successfully';
      e.target.reset();
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = data.message || data.error || 'Failed to change password';
    }
  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = err.message || 'Network error';
  }
});