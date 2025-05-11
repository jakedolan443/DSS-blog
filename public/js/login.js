document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login_form");
  const loginError = document.getElementById("login_error");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username_input").value.trim();
    const password = document.getElementById("password_input").value.trim();

    // Clear any existing error messages
    loginError.style.display = "none";
    loginError.textContent = "";

    // Validate input fields
    if (!username || !password) {
      displayError("Please fill out the login fields.");
      return;
    }

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Store the token in localStorage 
        localStorage.setItem("authToken", data.token);
        // Redirect to the homepage or dashboard
        window.location.href = "/";
      } else {
        // Display error message from server response
        displayError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      displayError("An unexpected error occurred. Please try again later.");
    }
  });

  function displayError(message) {
    loginError.textContent = message;
    loginError.style.display = "block";
  }
});
