document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/profile')
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("welcome-message").textContent = `Welcome, ${data.displayName || data.nickname || 'User'}!`;
            document.getElementById("user-email").textContent = `Your email: ${data.email || 'Not provided'}`;
        })
        .catch((error) => console.error("Error fetching user profile:", error));
});
