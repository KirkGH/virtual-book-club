document.getElementById("search-button").addEventListener("click", () => {
    const query = document.getElementById("search-input").value.trim();
    if (!query) {
      alert("Please enter a book title");
      return;
    }
  
    fetch(`/search?q=${query}`)
      .then(response => response.json())
      .then(data => {
        if (data.items && data.items.length > 0) {
          displayResults(data.items);
        } else {
          document.getElementById("results").innerHTML = "<p>No results found</p>";
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
        <p><strong>Publisher:</strong> ${bookInfo.publisher ? bookInfo.publisher : "Unknown"}</p>
        <p><strong>Published Date:</strong> ${bookInfo.publishedDate ? bookInfo.publishedDate : "Unknown"}</p>
        ${bookInfo.imageLinks && bookInfo.imageLinks.thumbnail ? `<img src="${bookInfo.imageLinks.thumbnail}" alt="${bookInfo.title} cover">` : ""}
      `;
  
      resultsDiv.appendChild(bookDiv);
    });
  }
  