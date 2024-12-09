document.addEventListener("DOMContentLoaded", function () {
  const joinClubForm = document.getElementById("joinClubForm");
  const joinStatus = document.getElementById("joinStatus");

  joinClubForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const joinCode = document.getElementById("joinCode").value.toUpperCase();

    const clubs = JSON.parse(localStorage.getItem("bookClubCode")) || [];

    const matchedClub = clubs.find((club) => club.clubCode === joinCode);

    if (matchedClub) {
      window.location.href =
        "/app/public/bookClub/clubCreation/bookClubHome/bookClubHome.html";
    } else {
      joinStatus.textContent = "Invalid join code. Please try again.";
    }
    joinClubForm.reset();
  });
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

document.getElementById('signupButton').addEventListener('click', function() {
  window.location.href = '/login';
});
