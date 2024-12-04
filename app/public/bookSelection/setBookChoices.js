document.addEventListener("DOMContentLoaded", function () {
  const bookSearchInput = document.getElementById("bookSearch");
  const bookResultsContainer = document.getElementById("bookResults");
  const selectedCountSpan = document.getElementById("selectedCount");
  const saveButton = document.getElementById("saveButton");

  let selectedBooks = [];

  bookSearchInput.addEventListener("input", async (e) => {
    const query = e.target.value;
    if (query.length > 2) {
      try {
        const response = await fetch(`/search?q=${query}`);
        const data = await response.json();
        displayBooks(data.items);
      } catch (error) {
        console.error("Error fetching book suggestions:", error);
      }
    } else {
      bookResultsContainer.innerHTML = "";
    }
  });

  function displayBooks(books) {
    bookResultsContainer.innerHTML = "";
    books.forEach((book) => {
      const title = book.volumeInfo.title || "Untitled";
      const authors = book.volumeInfo.authors?.join(", ") || "Unknown Author";
      const thumbnail = book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150";

      const bookCard = document.createElement("div");
      bookCard.classList.add("book-card");
      bookCard.innerHTML = `
        <img src="${thumbnail}" alt="${title}">
        <p><strong>${title}</strong></p>
        <p>by ${authors}</p>
      `;
      bookCard.addEventListener("click", () => toggleBookSelection(bookCard, { title, authors }));
      bookResultsContainer.appendChild(bookCard);
    });
  }

  function toggleBookSelection(bookCard, book) {
    const bookIdentifier = `${book.title} by ${book.authors}`;
    if (bookCard.classList.contains("selected")) {
      bookCard.classList.remove("selected");
      selectedBooks = selectedBooks.filter((b) => b !== bookIdentifier);
    } else if (selectedBooks.length < 3) {
      bookCard.classList.add("selected");
      selectedBooks.push(bookIdentifier);
    } else {
      alert("You can only select up to 3 books.");
    }
    updateSelectionCount();
  }

  function updateSelectionCount() {
    selectedCountSpan.textContent = selectedBooks.length;
    saveButton.disabled = selectedBooks.length === 0;
  }

  saveButton.addEventListener("click", () => {
    localStorage.setItem("bookChoices", JSON.stringify(selectedBooks));
    alert("Book choices saved!");
  });
});
