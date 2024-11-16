document.addEventListener("DOMContentLoaded", function () {
  const bookClubForm = document.getElementById("bookClubForm");

  bookClubForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clubName = document.getElementById("clubName").value;
    const description = document.getElementById("description").value;
    const genre = document.getElementById("genre").value;
    const meetingFrequency = document.getElementById("meetingFrequency").value;

    // Save to localStorage for now until can be stored on database
    const bookClubData = {
      clubName,
      description,
      genre,
      meetingFrequency,
    };
    localStorage.setItem("bookClubData", JSON.stringify(bookClubData));

    window.location.href = "./bookClubHome/bookClubHome.html";
  });
});
