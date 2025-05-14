document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      
      const popup = document.getElementById('success-popup');
      popup.style.display = 'block';

      setTimeout(() => {
        popup.style.display = 'none';
        sessionStorage.setItem('username', username);
        window.location.href = '/';
      }, 2000); // 2000ms (2s)


    } else {
      document.getElementById('error').textContent = data.message || 'Registration failed';
    }
  } catch (err) {
    console.error('Register error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});
