document.addEventListener("DOMContentLoaded", function () {
  const bookSearchInput = document.getElementById("bookSearch");
  const searchButton = document.getElementById("searchButton");
  const bookResultsContainer = document.getElementById("bookResults");
  const selectedCountSpan = document.getElementById("selectedCount");
  const saveButton = document.getElementById("saveButton");
  const selectedBooksList = document.getElementById("selectedBooksList");

  let selectedBooks = [];

  searchButton.addEventListener("click", async () => {
    const query = bookSearchInput.value.trim();
    if (query.length > 2) {
      try {
        const response = await fetch(`/search?q=${query}`);
        const data = await response.json();
        displayBooks(data.items);
      } catch (error) {
        console.error("Error fetching book suggestions:", error);
      }
    } else {
      alert("Please enter at least 3 characters to search.");
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

    updateDisplayedBooks(); // Sync UI with the selectedBooks array
  }

  function toggleBookSelection(bookCard, book) {
    const bookIdentifier = `${book.title} by ${book.authors}`;
    if (bookCard.classList.contains("selected")) {
      bookCard.classList.remove("selected");
      selectedBooks = selectedBooks.filter((b) => b !== bookIdentifier);
      removeBookFromList(bookIdentifier);
    } else if (selectedBooks.length < 3) {
      bookCard.classList.add("selected");
      selectedBooks.push(bookIdentifier);
      addBookToList(bookIdentifier);
    } else {
      alert("You can only select up to 3 books.");
    }
    updateSelectionCount();
    updateDisplayedBooks(); // Re-render book cards to reflect changes
  }

  function addBookToList(bookIdentifier) {
    const listItem = document.createElement("li");
    listItem.textContent = bookIdentifier;

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.style.marginLeft = "10px";
    deleteButton.style.backgroundColor = "#dc3545";
    deleteButton.style.color = "white";
    deleteButton.style.border = "none";
    deleteButton.style.padding = "5px 10px";
    deleteButton.style.cursor = "pointer";
    deleteButton.addEventListener("click", () => {
      removeBookFromList(bookIdentifier);
      selectedBooks = selectedBooks.filter((b) => b !== bookIdentifier);
      updateDisplayedBooks();
      updateSelectionCount();
    });

    listItem.appendChild(deleteButton);
    selectedBooksList.appendChild(listItem);
  }

  function removeBookFromList(bookIdentifier) {
    const items = selectedBooksList.querySelectorAll("li");
    items.forEach((item) => {
      if (item.textContent.includes(bookIdentifier)) {
        item.remove();
      }
    });
  }

  function updateDisplayedBooks() {
    const bookCards = bookResultsContainer.querySelectorAll(".book-card");
    bookCards.forEach((card) => {
      const cardTitle = card.querySelector("strong").textContent;
      const cardAuthors = card.querySelector("p:nth-child(3)").textContent.replace("by ", "");
      const cardInfo = `${cardTitle} by ${cardAuthors}`;
      if (selectedBooks.includes(cardInfo)) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }
    });
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
