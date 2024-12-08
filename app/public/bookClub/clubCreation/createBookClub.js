document.addEventListener("DOMContentLoaded", function () {
  const bookClubForm = document.getElementById("bookClubForm");

  bookClubForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clubName = document.getElementById("clubName").value;
    const description = document.getElementById("description").value;
    const genre = document.getElementById("genre").value;
    const meetingFrequency = document.getElementById("meetingFrequency").value;

    // Generate club code
    const clubCodeDisplay = document.getElementById("clubCodeDisplay");
    const clubCodeElement = document.getElementById("clubCode");
    const clubCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Store club data in localStorage
    const bookClubs = JSON.parse(localStorage.getItem("bookClubCode")) || [];
    bookClubs.push({ clubCode });
    localStorage.setItem("bookClubCode", JSON.stringify(bookClubs));

    clubCodeElement.textContent = clubCode;
    clubCodeDisplay.hidden = false;
    // Generate club code end

    const someUser = "user123";

    const bookClubData = {
      name: clubName,
      description: description,
      created_by: someUser,
      genre: genre,
      meetfrequency: meetingFrequency,
    };
    fetch("/createBookClub", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookClubData),
    })
      .then((response) => {
        if (response.ok) {
          console.log("Success");
        } else {
          // Handle errors
          console.error("Failed to create book club:", response.statusText);
          alert(
            "An error occurred while creating the book club. Please try again."
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert(
          "An error occurred while connecting to the server. Please try again."
        );
      });
  });
});

function toggleMenu() {
  const userMenu = document.getElementById("userMenuID");
  userMenu.classList.toggle("active");
}

document.addEventListener("click", function (event) {
  const userMenu = document.getElementById("userMenuID");
  const userNameButton = document.querySelector(".userNameClass");

  if (
    !userNameButton.contains(event.target) &&
    !userMenu.contains(event.target)
  ) {
    userMenu.classList.remove("active");
  }
});
