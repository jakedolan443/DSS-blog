// my_posts.js
//
// Purpose: Handles post creation, editing, deletion and rendering for my posts page
// 
// 
//
// Author: Kaleb Suter
// Date: 10/05/2025

// Extracts user info from JWT stored in localStorage
function getUserFromToken() {
    const token = localStorage.getItem("authToken");
    if (!token) return null;

    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Invalid token:", e);
        return null;
    }
}

// Fetches posts for the logged-in user and displays them
async function loadPosts() {
    const user = getUserFromToken();
    if (!user) {
        alert("You must be logged in to view your posts.");
        return;
    }

    try {
        const res = await fetch("/posts", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`
            }
        });

        const post_data = await res.json();
        const postList = document.getElementById('myPosts');
        postList.innerHTML = "";

        post_data
            .filter(post => post.username === user.username)
            .forEach(post => {
                const { id, username, created_at, title, content } = post;

                let postContainer = document.createElement('article');
                postContainer.classList.add("post");

                postContainer.__rawMarkdown = content;

                let fig = document.createElement('figure');
                postContainer.appendChild(fig);

                let postIdContainer = document.createElement("h6");
                postIdContainer.textContent = id;
                postIdContainer.hidden = true;
                postIdContainer.id = "postId";
                postContainer.appendChild(postIdContainer);

                let img = document.createElement('img');
                let figcap = document.createElement('figcaption');
                fig.appendChild(img);
                fig.appendChild(figcap);

                let titleContainer = document.createElement('h3');
                titleContainer.textContent = title;
                figcap.appendChild(titleContainer);

                let usernameContainer = document.createElement('h5');
                usernameContainer.textContent = username;
                figcap.appendChild(usernameContainer);

                let timeContainer = document.createElement('h5');
                timeContainer.textContent = new Date(created_at).toLocaleString();
                figcap.appendChild(timeContainer);

                let contentContainer = document.createElement('div');
                const cleanHTML = DOMPurify.sanitize(marked.parse(content));
                contentContainer.innerHTML = cleanHTML;
                figcap.appendChild(contentContainer);

                let editBtn = document.createElement('button');
                editBtn.classList.add('editBtn');
                editBtn.textContent = "Edit";
                editBtn.addEventListener("click", editPost);
                postContainer.appendChild(editBtn);

                let delBtn = document.createElement('button');
                delBtn.classList.add('delBtn');
                delBtn.textContent = "Delete";
                delBtn.addEventListener("click", deletePost);
                postContainer.appendChild(delBtn);

                postList.insertBefore(postContainer, postList.firstChild);
            });

    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

// Send request to delete a post from the backend
async function deletePost(e) {
    const token = localStorage.getItem("authToken");
    const postId = e.target.parentNode.querySelector("#postId").textContent;

    try {
        await fetch(`/posts/${postId}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        e.target.parentNode.hidden = true;
    } catch (error) {
        console.error("Failed to delete post:", error);
    }
}

// Populates the post form with data from the post being edited
function editPost(e) {
    const post = e.target.parentNode;

    document.getElementById("title_field").value = post.querySelector("h3").textContent;
    document.getElementById("content_field").value = post.__rawMarkdown;
    document.getElementById("postId").value = post.querySelector("h6#postId").textContent;

    document.getElementById("postForm").scrollIntoView({ behavior: "smooth" });
}

// Handles submission for both creating and editing posts
document.getElementById("postForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in.");
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const user_id = payload.id;

    const title = document.getElementById("title_field").value.trim();
    const content = document.getElementById("content_field").value.trim();
    const postId = document.getElementById("postId").value;

    if (!title || !content) {
        alert("Title and content are required.");
        return;
    }

    const isEditing = postId !== "";
    const url = isEditing ? `/posts/${postId}` : "/posts";
    const method = isEditing ? "PUT" : "POST";

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                content,
                user_id
            })
        });

        const result = await res.json();

        if (res.ok) {
            alert(isEditing ? "Post updated!" : "Post created!");
            window.location.reload();
        } else {
            alert(result.message || "Failed to post.");
        }
    } catch (err) {
        console.error("Post submission failed:", err);
        alert("Something went wrong.");
    }
});

// Uploads image and inserts markdown reference into the textarea 
document.getElementById("uploadImageBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageUpload");
    const file = fileInput.files[0];
    const token = localStorage.getItem("authToken");

    if (!file) {
        alert("Please select an image to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const res = await fetch("/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        const result = await res.json();
        if (res.ok) {
            const textarea = document.getElementById("content_field");
            const markdown = `\n![alt text](${result.imagePath})\n`;
            textarea.value += markdown;
            alert("Image uploaded and markdown added to your post.");
            fileInput.value = "";
        } else {
            alert(result.message || "Upload failed");
        }
    } catch (err) {
        console.error("Image upload error:", err);
        alert("Error uploading image.");
    }
});

// Trigger post loading when the page loads
document.addEventListener("DOMContentLoaded", loadPosts);
