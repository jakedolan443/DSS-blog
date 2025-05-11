// posts.js
//
// Purpose: Handles loading, displaying, and searching posts for the latest posts page
//
// Author: Kaleb Suter
// Date: 10/05/2025

let postData = [];
let postsDisplayed = 0;
const postsPerLoad = 10;

async function fetchAllPosts() {
    try {
        const res = await fetch('http://localhost:3000/posts');
        postData = await res.json();
        postData.reverse(); // newest first
        loadMorePosts();
    } catch (err) {
        console.error("Failed to fetch posts:", err);
    }
}

function loadMorePosts() {
    const postList = document.getElementById('postsList');
    const toDisplay = postData.slice(postsDisplayed, postsDisplayed + postsPerLoad);

    toDisplay.forEach(post => {
        const { id, title, username, created_at, content } = post;

        const postEl = document.createElement('article');
        postEl.classList.add('post');
        postEl.style.height = "500px";
        postEl.style.overflow = "hidden";
        postEl.style.cursor = "pointer";

        postEl.addEventListener("click", () => {
            window.location.href = `/post.html?id=${id}`;
        });

        postEl.innerHTML = `
            <h3>${title}</h3>
            <h5>${username} – ${new Date(created_at).toLocaleString()}</h5>
            <div>${content}</div>
        `;

        postList.appendChild(postEl);
    });

    postsDisplayed += toDisplay.length;
}

function searchPosts() {
    const filter = document.getElementById('search').value.toUpperCase();
    const posts = document.getElementById('postsList').getElementsByTagName('article');

    for (let i = 0; i < posts.length; i++) {
        let text = posts[i].textContent || posts[i].innerText;
        posts[i].style.display = text.toUpperCase().includes(filter) ? "" : "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchAllPosts();

    const searchInput = document.getElementById("search");
    if (searchInput) {
        searchInput.addEventListener("keyup", searchPosts);
    }
});
