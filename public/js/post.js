// post.js
//
// Purpose:  Handles displaying a single post and its comments
//
// Author: Kaleb Suter
// Date: 10/05/2025

// Loads the post and its comments 
async function loadPostAndComments() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("id");

    if (!postId) return;

    try {
        // Fetch and render the post
        const postRes = await fetch(`http://localhost:3000/posts/${postId}`);
        if (!postRes.ok) throw new Error("Post not found");

        const post = await postRes.json();
        const { title, content, username, created_at } = post;

        const postDetails = document.getElementById('postDetails');
        postDetails.innerHTML = `
            <h2>${title}</h2>
            <h5>${username} – ${new Date(created_at).toLocaleString()}</h5>
            <div>${marked.parse(content)}</div>
        `;

        // Fetch and display comments
        const commentsRes = await fetch(`http://localhost:3000/posts/${postId}/comments`);
        const comments = await commentsRes.json();

        const commentList = document.getElementById("commentList");
        comments.forEach(comment => {
            const li = document.createElement("li");
            const safeContent = comment.text || comment.content || ""; 
            li.innerHTML = `<strong>${comment.username}</strong>: ${marked.parse(safeContent)}`;
            commentList.appendChild(li);
        });

    } catch (err) {
        console.error("Failed to load post or comments:", err);
        document.getElementById('postDetails').innerHTML = "<p>Unable to load post.</p>";
    }
}

document.addEventListener("DOMContentLoaded", loadPostAndComments);

// Handles comment form submission
document.getElementById("commentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("You must be logged in to comment.");
        return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const user_id = payload.id;

    const postId = new URLSearchParams(window.location.search).get("id");
    const content = document.getElementById("comment_field")?.value.trim();

    console.log("Sending comment:", { user_id, content, postId });

    if (!content) {
        alert("Comment cannot be empty.");
        return;
    }

    try {
        const res = await fetch(`/posts/${postId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ user_id, content })
        });

        const result = await res.json();

        if (res.ok) {
            alert("Comment posted!");
            window.location.reload();
        } else {
            alert(result.message || "Failed to post comment.");
        }
    } catch (err) {
        console.error("Comment submission failed:", err);
        alert("Something went wrong.");
    }
});

