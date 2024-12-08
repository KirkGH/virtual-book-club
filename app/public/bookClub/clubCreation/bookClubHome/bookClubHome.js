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
        bookClubData.meetFrequency;
    }
  }catch (error) {
    console.error("Error loading book club data:", error);
  }
});

function navigateTo(page) {
  window.location.href = page;
}
