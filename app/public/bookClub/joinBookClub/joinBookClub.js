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
