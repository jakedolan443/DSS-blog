const easyMDE = new EasyMDE({ element: document.getElementById('editor') });
const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get('id');

// Setup form
const submitButton = document.getElementById('submit-button');

if (postId) {
  // Editing an existing post
  submitButton.textContent = 'Update Post';

  fetch(`http://localhost:3000/posts/${postId}`)
    .then(res => res.json())
    .then(post => {
      document.getElementById('title').value = post.title;
      easyMDE.value(post.content);
    });

  submitButton.addEventListener('click', updatePost);
} else {
  // Creating a new post
  submitButton.textContent = 'Submit Post';
  submitButton.addEventListener('click', submitPost);
}

function uploadImage() {
  const fileInput = document.getElementById('imageUpload');
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to upload.");
    return;
  }

  const formData = new FormData();
  formData.append('image', file);

  fetch('http://localhost:3000/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (data && data.imagePath) {
        const imageMarkdown = `![Alt text](${data.imagePath})`;
        easyMDE.value(easyMDE.value() + '\n' + imageMarkdown);
      } else {
        console.error('Image upload failed:', data);
        alert('An error occurred while uploading the image.');
      }
    })
    .catch(err => {
      console.error('Image upload failed:', err);
      alert('An error occurred while uploading the image.');
    });
}

function submitPost() {
  fetch('http://localhost:3000/authenticate', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.id) {
        const title = document.getElementById('title').value;
        const content = easyMDE.value();
        const user_id = user.id;

        fetch('http://localhost:3000/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id, title, content }),
          credentials: 'include'
        }).then(res => {
          if (res.ok) {
            window.location.href = '/';
          }
        });
      } else {
        alert('You must be logged in to create a post.');
        window.location.href = '/login.html';
      }
    })
    .catch(err => {
      console.error('Authentication failed:', err);
      alert('An error occurred while checking your authentication status.');
    });
}

function updatePost() {
  fetch('http://localhost:3000/authenticate', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(user => {
      if (user && user.id) {
        const title = document.getElementById('title').value;
        const content = easyMDE.value();

        fetch(`http://localhost:3000/posts/${postId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
          credentials: 'include'
        }).then(res => {
          if (res.ok) {
            window.location.href = `/post.html?id=${postId}`;
          } else {
            alert('Failed to update post.');
          }
        });
      } else {
        alert('You must be logged in to update a post.');
        window.location.href = '/login.html';
      }
    })
    .catch(err => {
      console.error('Authentication failed:', err);
      alert('An error occurred while checking your authentication status.');
    });
}
