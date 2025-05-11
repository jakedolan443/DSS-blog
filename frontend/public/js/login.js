document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      sessionStorage.setItem('username', username);

      window.location.href = '/';
    } else {
      document.getElementById('error').textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});
