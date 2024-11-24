document.addEventListener("DOMContentLoaded", function () {
  const setBooksForm = document.getElementById("setBooksForm");

  setBooksForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const bookChoices = [
      document.getElementById("book1").value,
      document.getElementById("book2").value,
      document.getElementById("book3").value,
    ];

    // temporarily store in localStorage
    localStorage.setItem("bookChoices", JSON.stringify(bookChoices));
    alert("Book choices have been saved!");
  });
});
