document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  const security_questions = [
    {
      index: parseInt(e.target['question-1'].value),
      answer: e.target['answer-1'].value.trim()
    },
    {
      index: parseInt(e.target['question-2'].value),
      answer: e.target['answer-2'].value.trim()
    },
    {
      index: parseInt(e.target['question-3'].value),
      answer: e.target['answer-3'].value.trim()
    }
  ];

  // Basic check on uniqueness
  const indexes = security_questions.map(q => q.index);
  if (new Set(indexes).size !== 3) {
    document.getElementById('error').textContent = 'Security questions must be unique';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password, security_questions }),
    });

    const data = await res.json();

    if (res.ok) {
      document.getElementById('success-popup').style.display = 'block';
      setTimeout(() => {
        sessionStorage.setItem('username', username);
        window.location.href = '/';
      }, 2000);
    } else {
      document.getElementById('error').textContent = data.message || 'Registration failed';
    }
  } catch (err) {
    console.error('Register error:', err);
    document.getElementById('error').textContent = 'An unexpected error occurred';
  }
});
