document.addEventListener("DOMContentLoaded", function () {
  const bookClubForm = document.getElementById("bookClubForm");

  bookClubForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const clubName = document.getElementById("clubName").value;
    const description = document.getElementById("description").value;
    const genre = document.getElementById("genre").value;
    const meetingFrequency = document.getElementById("meetingFrequency").value;

    // Save to localStorage for now until can be stored on database
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
          // Redirect to book club home page on success
          window.location.href = "./bookClubHome/bookClubHome.html";
        } else {
          // Handle errors
          console.error("Failed to create book club:", response.statusText);
          alert("An error occurred while creating the book club. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while connecting to the server. Please try again.");
     
    //localStorage.setItem("bookClubData", JSON.stringify(bookClubData));
    // End

    //window.location.href = "./bookClubHome/bookClubHome.html";
      });
  });
});
