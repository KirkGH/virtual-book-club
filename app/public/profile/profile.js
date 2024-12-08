document.addEventListener("DOMContentLoaded", () => {
    fetch('/api/profile')
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("welcome-message").textContent = `Welcome, ${data.displayName || data.nickname || 'User'}!`;
            document.getElementById("user-email").textContent = `Your email: ${data.email || 'Not provided'}`;
        })
        .catch((error) => console.error("Error fetching user profile:", error));
});

function toggleMenu() {
    const userMenu = document.getElementById('userMenuID');
    userMenu.classList.toggle('active');
}

document.addEventListener('click', function (event) {
    const userMenu = document.getElementById('userMenuID');
    const userNameButton = document.querySelector('.userNameClass');

    if (!userNameButton.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.remove('active');
    }
});

fetch('/user')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    const username = document.getElementById('usernameID');
    if (data.name) {
      username.innerText = `Welcome, ${data.name}`;
    } else {
      username.innerText = 'Welcome, Guest';
    }
  })
  .catch((error) => {
    console.error('Error fetching user data:', error);
    document.getElementById('usernameID').innerText = 'Error loading user';
  });