document.addEventListener("DOMContentLoaded", async function () {
  
  try {
    const response = await fetch("/bookClubHome");
    if (!response.ok) {
      throw new Error("Failed to fetch book club data");
    }
    const bookClubData = await response.json();
    
    if (bookClubData) {
      document.getElementById("clubNameHeading").textContent =
        bookClubData.name;
      document.getElementById("clubDescription").textContent =
        bookClubData.description;
      document.getElementById("clubGenre").textContent = bookClubData.genre;
      document.getElementById("clubFrequency").textContent =
        bookClubData.meetfrequency;
    }
  }catch (error) {
    console.error("Error loading book club data:", error);
  }
});

function navigateTo(page) {
  window.location.href = page;
}

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

document.getElementById('signupButton').addEventListener('click', function() {
  window.location.href = '/login';
});
