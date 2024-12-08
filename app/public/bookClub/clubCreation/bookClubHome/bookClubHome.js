document.addEventListener("DOMContentLoaded", function () {
  const bookClubData = JSON.parse(localStorage.getItem("bookClubData"));

  if (bookClubData) {
    document.getElementById("clubNameHeading").textContent =
      bookClubData.clubName;
    document.getElementById("clubDescription").textContent =
      bookClubData.description;
    document.getElementById("clubGenre").textContent = bookClubData.genre;
    document.getElementById("clubFrequency").textContent =
      bookClubData.meetingFrequency;
  }
});

function navigateTo(page) {
  window.location.href = page;
}
