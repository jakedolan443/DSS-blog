// index.js
//
// Purpose: Load and display the latest posts on the homepage
//
// Authors: Kaleb Suter
// Date: 10/05/2025

async function loadLatestPosts() {
    try {
        const res = await fetch("http://localhost:3000/posts");
        const posts = await res.json();
        const postList = document.getElementById('postsList');

        const latestPosts = posts.slice(-10).reverse(); // newest 10

        latestPosts.forEach(post => {
            const { id, title, content, username, created_at } = post;

            let postContainer = document.createElement('article');
            postContainer.classList.add("post");
            postContainer.style.height = "500px";
            postContainer.style.overflow = "hidden";
            postContainer.style.cursor = "pointer";

            postContainer.addEventListener('click', () => {
                window.location.href = `/post.html?id=${id}`;
            });

            postContainer.innerHTML = `
                <h3>${title}</h3>
                <h5>${username} – ${new Date(created_at).toLocaleString()}</h5>
                <div>${marked.parse(content)}</div>
            `;

            // Insert before the "Show More" <a>
            const showMoreLink = postList.querySelector("p a[href='/posts.html']");
            postList.insertBefore(postContainer, showMoreLink.parentElement);
        });

    } catch (err) {
        console.error("Failed to load posts:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadLatestPosts);
