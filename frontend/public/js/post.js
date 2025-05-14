const postContainer = document.getElementById('post-container');
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

function getPostIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadPostAndComments() {
  const postId = getPostIdFromURL();
  if (!postId) {
    postContainer.innerHTML = '<p>Post ID missing from URL.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/posts/${postId}`);
    if (!res.ok) throw new Error('Failed to fetch post');
    const post = await res.json();

    const userRes = await fetch(`http://localhost:3000/user/${post.user_id}`);
    const userData = await userRes.ok ? await userRes.json() : { username: 'Unknown' };

    const commentsRes = await fetch(`http://localhost:3000/posts/${postId}/comments`);
    const comments = await commentsRes.ok ? await commentsRes.json() : [];

    const likedByCurrentUser = currentUserId && post.liked_by.includes(currentUserId);
    let likeCount = post.liked_by.length;

    const div = document.createElement('div');
    div.classList.add('post');

div.innerHTML = `
  <h2>${post.title}</h2>
  <p><small>by <a href="/user/${userData.username}">${userData.username}</a> on ${new Date(post.created_at).toLocaleString()},
  👍 <span id="like-count">${likeCount}</span> likes</small></p>
  <div class="content">${marked.parse(post.content)}</div>
  <button id="like-post-btn">${likedByCurrentUser ? 'Unlike' : 'Like'}</button>
  ${currentUserId === post.user_id ? `<button onclick="location.href='create.html?id=${post.id}'">Edit</button>` : ''}
  <hr>
  <hr>
  <h3>Comments (${comments.length})</h3>
  <div id="comments-section">
    ${(
      await Promise.all(comments.map(async (comment) => {
        const userRes = await fetch(`http://localhost:3000/users/${comment.user_id}`);
        const userData = userRes.ok ? await userRes.json() : { username: 'Unknown' };

        return `
          <div class="comment">
            <p><a href="/users/${userData.username}">${userData.username || 'Anonymous'}</a>: ${comment.content}</p>
          </div>
        `;
      }))
    ).join('')}
  </div>

  ${currentUserId ? `
    <form id="comment-form">
      <textarea id="comment-content" rows="3" placeholder="Write a comment..." required></textarea>
      <br>
      <button type="submit">Submit Comment</button>
    </form>
  ` : `<p><a href="/login.html">Log in</a> to write a comment.</p>`}`;



    postContainer.appendChild(div);

    const likeBtn = document.getElementById('like-post-btn');
    const likeCountSpan = document.getElementById('like-count');

    likeBtn.addEventListener('click', async () => {
      if (!currentUserId) {
        alert('Please log in to like posts.');
        return;
      }

      const action = post.liked_by.includes(currentUserId) ? 'unlike' : 'like';
      const res = await fetch(`http://localhost:3000/posts/${postId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const updated = await res.json();
        post.liked_by = updated.post.liked_by;
        likeBtn.textContent = post.liked_by.includes(currentUserId) ? 'Unlike' : 'Like';
        likeCountSpan.textContent = post.liked_by.length;
      } else {
        alert('Failed to update like');
      }
    });

    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = document.getElementById('comment-content').value.trim();
        if (!content) return;

        try {
          const res = await fetch('http://localhost:3000/authenticate', {
            method: 'GET',
            credentials: 'include',
          });

          if (!res.ok) throw new Error('Authentication failed');
          const user = await res.json();

          const commentRes = await fetch(`http://localhost:3000/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, content }),
            credentials: 'include',
          });

          if (commentRes.ok) {
            location.reload(); // reload to show the new comment
          } else {
            alert('Failed to submit comment.');
          }
        } catch (err) {
          console.error(err);
          alert('Error submitting comment.');
        }
      });
    }


  } catch (err) {
    console.error(err);
    postContainer.innerHTML = `<p>Error loading post.</p>`;
  }
}

displayUsername();
loadPostAndComments();
