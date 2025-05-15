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

    if (res.status === 200) {
      document.getElementById('error').textContent = '';
      const popup = document.getElementById('success-popup');
      popup.style.display = 'block';

      setTimeout(() => {
        popup.style.display = 'none';
        sessionStorage.setItem('username', username);
        window.location.href = '/';
      }, 2000);

    } else if (res.status === 403 && data.message?.startsWith('2FA required')) {
      document.getElementById('login-form').style.display = 'none';

      const codeForm = document.getElementById('code-form');
      codeForm.style.display = 'block';
      codeForm.dataset.username = username;
    } else if (res.status === 403 && data.security_question_index !== undefined) {
      // Security question required – show new form
      document.getElementById('login-form').style.display = 'none';

      const secForm = document.getElementById('security-form');
      secForm.style.display = 'block';
      document.getElementById('security-question').textContent = data.security_question_text;

      // Save necessary data in dataset for later
      secForm.dataset.username = username;
      secForm.dataset.password = password;
      secForm.dataset.questionIndex = data.security_question_index;

    } else {
      document.getElementById('error').textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});

document.getElementById('security-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const answer = e.target.security_answer.value;
  const username = e.target.dataset.username;
  const password = e.target.dataset.password;
  const questionIndex = parseInt(e.target.dataset.questionIndex, 10);

  try {
    const res = await fetch('http://localhost:3000/login-secure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        username,
        password,
        security_question_index: questionIndex,
        security_answer: answer
      }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('error').textContent = '';
      const popup = document.getElementById('success-popup');
      popup.style.display = 'block';

      setTimeout(() => {
        popup.style.display = 'none';
        sessionStorage.setItem('username', username);
        window.location.href = '/';
      }, 2000);
    } else {
      document.getElementById('error').textContent = data.message || 'Verification failed';
    }
  } catch (err) {
    console.error('Security question verification error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});

document.getElementById('code-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const code = e.target.code.value;
  const username = e.target.dataset.username;

  try {
    const res = await fetch('http://localhost:3000/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, code }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('error').textContent = '';
      const popup = document.getElementById('success-popup');
      popup.style.display = 'block';

      setTimeout(() => {
        popup.style.display = 'none';
        sessionStorage.setItem('username', username);
        window.location.href = '/';
      }, 2000);
    } else {
      document.getElementById('error').textContent = data.message || 'Invalid code';
    }
  } catch (err) {
    console.error('2FA verification error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});

