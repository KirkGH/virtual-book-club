document.addEventListener("DOMContentLoaded", function () {
  const voteForm = document.getElementById("voteForm");
  const resultSection = document.getElementById("resultSection");
  const resultMessage = document.getElementById("resultMessage");

  const bookChoices = JSON.parse(localStorage.getItem("bookChoices"));
  if (bookChoices) {
    const options = document.querySelectorAll("input[name='bookChoice']");
    options[0].nextElementSibling.textContent = bookChoices[0];
    options[1].nextElementSibling.textContent = bookChoices[1];
    options[2].nextElementSibling.textContent = bookChoices[2];
  }

  voteForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const selectedBook = document.querySelector(
      "input[name='bookChoice']:checked"
    ).value;

    resultMessage.textContent = `You voted for: ${selectedBook}`;
    resultSection.hidden = false;

    // temporarily store in localStorage
    let votes = JSON.parse(localStorage.getItem("bookVotes")) || {};
    votes[selectedBook] = (votes[selectedBook] || 0) + 1;
    localStorage.setItem("bookVotes", JSON.stringify(votes));

    voteForm.hidden = true;
  });
});