document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.trim();
    const author = document.getElementById("author-input").value.trim();
    const genre = document.getElementById("genre-select").value;
  
    if (!query && !author && !genre) {
      alert("Please enter at least a title, author, or select a genre.");
      return;
    }
  
    fetch(`/search?q=${query}&author=${author}&genre=${genre}`)
      .then(response => response.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          displayResults(data.items);
        } else {
          document.getElementById("results").innerHTML = `<p>${data.message || "No results found"}</p>`;
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        document.getElementById("results").innerHTML = "<p>Error fetching data. Please try again later.</p>";
      });
  });
  
  function displayResults(books) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "";
  
    books.forEach(book => {
      const bookInfo = book.volumeInfo;
      const bookDiv = document.createElement("div");
      bookDiv.classList.add("book");
  
      bookDiv.innerHTML = `
        <h3>${bookInfo.title}</h3>
        <p><strong>Author(s):</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown"}</p>
        <p><strong>Publisher:</strong> ${bookInfo.publisher || "Unknown"}</p>
        <p><strong>Published Date:</strong> ${bookInfo.publishedDate || "Unknown"}</p>
        ${bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? `<img src="${bookInfo.imageLinks.thumbnail}" alt="${bookInfo.title} cover">` : ""}
      `;
  
      resultsDiv.appendChild(bookDiv);
    });
  }

document.getElementById("popular-books-button").addEventListener("click", () => {
    fetch('/popularBooks')
      .then(response => response.json())
      .then(data => {
        console.log("Received Popular Books:", data);  // Log to check the data being received
        const resultsDiv = document.getElementById("popular-books-results");
        if (data.items && data.items.length > 0) {
          displayPopularBooks(data.items);
        } else {
          resultsDiv.innerHTML = `<p>No popular books found.</p>`;
        }
      })
      .catch(error => {
        console.error("Error fetching popular books:", error);
        document.getElementById("popular-books-results").innerHTML = "<p>Error fetching data. Please try again later.</p>";
      });
});

function displayPopularBooks(books) {
    const resultsDiv = document.getElementById("popular-books-results");
    resultsDiv.innerHTML = "";  // Clear previous results

    books.forEach(book => {
      const bookInfo = book.volumeInfo;
      const bookDiv = document.createElement("div");
      bookDiv.classList.add("book");

      bookDiv.innerHTML = `
        <h3>${bookInfo.title}</h3>
        <p><strong>Author(s):</strong> ${bookInfo.authors ? bookInfo.authors.join(", ") : "Unknown"}</p>
        <p><strong>Publisher:</strong> ${bookInfo.publisher || "Unknown"}</p>
        <p><strong>Published Date:</strong> ${bookInfo.publishedDate || "Unknown"}</p>
        ${bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? `<img src="${bookInfo.imageLinks.thumbnail}" alt="${bookInfo.title} cover">` : ""}
      `;

      resultsDiv.appendChild(bookDiv);
    });
}

