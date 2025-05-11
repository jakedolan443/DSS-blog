// main.js
//
// Purpose: Displays the logged in user's username
//
// Authors: Kaleb Suter
// Date: 10/05/2025

function displayUsername() {
    const token = localStorage.getItem("authToken");

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.username;

            const loginLink = document.querySelector("#login_link");
            if (loginLink) {
                loginLink.innerHTML = `${username} <i class="fa fa-caret-down"></i>`;
            }
        } catch (err) {
            console.error("Invalid token format:", err);
        }
    }
}


displayUsername();