const userUsernameElement = document.getElementById('user-username');
const userPostsContainer = document.getElementById('user-posts-container');
const usernameDisplay = document.getElementById('username-display');
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');

let currentUserId = null;

async function displayUsername() {
  try {
    const res = await fetch('http://localhost:3000/authenticate', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      usernameDisplay.textContent = `Logged in as: ${data.username}`;
      currentUserId = data.id;
      sessionStorage.setItem('userId', data.id);
      loginLink.style.display = 'none';
      logoutBtn.style.display = 'inline';
    } else {
      throw new Error('Not logged in');
    }
  } catch (err) {
    usernameDisplay.textContent = 'Not logged in';
    loginLink.style.display = 'inline';
    logoutBtn.style.display = 'none';
  }
}

logoutBtn.addEventListener('click', async () => {
  try {
    const res = await fetch('http://localhost:3000/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (res.ok) {
      sessionStorage.removeItem('userId');
      location.reload();
    }
  } catch (err) {
    console.error('Logout failed:', err);
  }
});

async function loadUserPosts(username) {
  try {
    const postsRes = await fetch('http://localhost:3000/posts');
    if (!postsRes.ok) throw new Error('Failed to fetch posts');
    const posts = await postsRes.json();

    const userPosts = [];

    for (const post of posts) {
      const userRes = await fetch(`http://localhost:3000/users/${post.user_id}`);
      if (!userRes.ok) {
        console.error(`Failed to fetch user data for post ${post.id}`);
        continue;
      }
      const user = await userRes.json();

      // If the username matches the one in the url add the post to the userPosts array
      if (user.username === username) {
        userPosts.push(post);
      }
    }
    userUsernameElement.textContent = `${username}`;
    if (userPosts.length === 0) {
      userPostsContainer.innerHTML = '<p>No posts yet.</p>';
      return;
    }
    userPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      postElement.innerHTML = `
        <h2>${post.title}</h2>
        <p><small>by <a href="/user/${username}">${username}</a> on ${new Date(post.created_at).toLocaleString()}</small></p>
        <div class="content">${marked.parse(post.content)}</div>
      `;
      userPostsContainer.appendChild(postElement);
    });

  } catch (err) {
    console.error(err);
    userPostsContainer.innerHTML = `<p>Error loading user posts.</p>`;
  }
}

const path = window.location.pathname;
const username = path.substring(path.lastIndexOf('/') + 1);

if (username) {
  loadUserPosts(username);
} else {
  userPostsContainer.innerHTML = '<p>No username specified in URL.</p>';
}

displayUsername();
