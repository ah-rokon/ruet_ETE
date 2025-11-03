document.addEventListener('DOMContentLoaded', () => {
  // Check if admin exists using an API call or some global variable
  fetch('/auth/checkAdmin')
    .then(response => response.json())
    .then(data => {
      if (!data.adminExists) {
        // Show admin creation form if no admin exists
        document.getElementById('formTitle').textContent = "Create Admin Account";
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('adminForm').style.display = 'block';
      } else {
        // Show login form if admin exists
        document.getElementById('formTitle').textContent = "Login";
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('adminForm').style.display = 'none';
      }
    })
    .catch(err => console.log(err));
});

// Admin account creation
document.getElementById('adminForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const adminEmail = document.getElementById('adminEmail').value;
  const adminPassword = document.getElementById('adminPassword').value;

  const response = await fetch('/auth/createAdmin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ adminEmail, adminPassword }),
  });

  const data = await response.json();

  if (response.status === 200) {
    // Admin created successfully, now redirect to login
    window.location.href = '/';
  } else {
    document.getElementById('errorMessage').textContent = data.message;
  }
});

// Login functionality
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.status === 200) {
    localStorage.setItem('token', data.token);
    if (data.role === 'admin') {
      window.location.href = '/adminDashboard.html';
    } else if (data.role === 'teacher') {
      window.location.href = '/teacherDashboard.html';
    } else {
      window.location.href = '/studentDashboard.html';
    }
  } else {
    document.getElementById('errorMessage').textContent = data.message;
  }
});
