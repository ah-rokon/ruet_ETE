document.getElementById('createAdminForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const adminEmail = document.getElementById('adminEmail').value;
  const adminPassword = document.getElementById('adminPassword').value;
  const messageEl = document.getElementById('createMessage');
  messageEl.textContent = '';

  try {
    const res = await fetch('/auth/createAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminEmail, adminPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      messageEl.style.color = 'green';
      messageEl.textContent = data.message || 'Admin created successfully';
      // Redirect to home/login after short delay
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } else {
      messageEl.style.color = 'red';
      messageEl.textContent = data.message || data.error || 'Failed to create admin';
    }
  } catch (err) {
    messageEl.style.color = 'red';
    messageEl.textContent = err.message || 'Network error';
  }
});

// Handle password change
document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmailChange').value;
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
        userType: 'admin'
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