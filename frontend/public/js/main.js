const feed = document.getElementById('feed');
const usernameDisplay = document.getElementById('username-display');
const loginLink = document.getElementById('login-link');
const logoutBtn = document.getElementById('logout-btn');


async function loadPosts() {
  const res = await fetch('http://localhost:3000/posts');
  const posts = await res.json();

  for (const post of posts) {
    let username = 'Unknown';
    let likedByCurrentUser = false;
    const currentUserId = sessionStorage.getItem('userId');

    try {
      const userRes = await fetch(`http://localhost:3000/users/${post.user_id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        username = userData.username;
      }
    } catch (err) {
      console.warn(`Failed to fetch username for user_id ${post.user_id}:`, err);
    }

    let likeAmount = post.liked_by.length;

    const commentsRes = await fetch(`http://localhost:3000/posts/${post.id}/comments`);
    const comments = await commentsRes.ok ? await commentsRes.json() : [];

    let commentAmount = comments.length;

    if (currentUserId && post.liked_by.includes(parseInt(currentUserId))) {
      likedByCurrentUser = true;
    }

    const div = document.createElement('div');
    div.classList.add("post");

    div.innerHTML = `
      <h2>${post.title}</h2>
      <p><small>by <a href="/user/${username}">${username}</a> on ${new Date(post.created_at).toLocaleString()}, 👍 ${likeAmount} likes, 💬 ${commentAmount} comments </small></p>
      <div class="content">${marked.parse(post.content)}</div>
      <button class="like-btn" data-post-id="${post.id}">
        ${likedByCurrentUser ? 'Unlike' : 'Like'}
      </button>
      ${isYourPost(post.user_id) ? `<button onclick="location.href='create.html?id=${post.id}'">Edit</button>` : ''}
    `;

    div.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        window.location.href = `post.html?id=${post.id}`;
      }
    });

    feed.appendChild(div);


    const likeBtn = div.querySelector('.like-btn');
    likeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const postId = post.id;

      const endpoint = likedByCurrentUser ? 'unlike' : 'like';
      const res = await fetch(`http://localhost:3000/posts/${postId}/${endpoint}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        likedByCurrentUser = !likedByCurrentUser;
        likeAmount += likedByCurrentUser ? 1 : -1;
        likeBtn.textContent = likedByCurrentUser ? 'Unlike' : 'Like';
      } else {
        console.error(`Error ${endpoint === 'like' ? 'liking' : 'unliking'} post:`, res.statusText);
      }

      div.querySelector('small').innerHTML = `by <a href="/user/${username}">${username}</a> on ${new Date(post.created_at).toLocaleString()}, 👍 ${likeAmount} likes, 💬 ${commentAmount} comments `;
    });
  }
}




function isYourPost(postUserId) {
  return false;
}

async function displayUsername() {
  try {
    const res = await fetch('http://localhost:3000/authenticate', {
      method: 'GET',
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      usernameDisplay.textContent = `Logged in as: ${data.username}`;
      sessionStorage.setItem('userId', data.id); // save user ID to sessionStorage (tmp)
      loginLink.style.display = 'none';
      logoutBtn.style.display = 'inline';
    } else {
      throw new Error('Not logged in');
    }
  } catch (err) {
    console.warn('User not logged in or auth check failed');
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
      sessionStorage.removeItem('username');

      window.location.reload();
    } else {
      console.error('Logout failed:', res.statusText);
    }
  } catch (err) {
    console.error('Logout failed:', err);
  }
});


loadPosts();
displayUsername();
