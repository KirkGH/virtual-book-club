document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.getElementById("postForm");
  const postsList = document.getElementById("postsList");

  postForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const bookTitle = document.getElementById("bookTitle").value;
    const author = document.getElementById("author").value;
    const postContent = document.getElementById("postContent").value;
    const postDiv = document.createElement("div");
    const userProfileDiv = document.createElement("div");

    const avatarImg = document.createElement("img");
    avatarImg.src = ""; // placeholder
    avatarImg.alt = "User Avatar";
    userProfileDiv.appendChild(avatarImg);

    const username = document.createElement("p");
    username.textContent = "rhn29"; // placeholder
    userProfileDiv.appendChild(username);

    const bookTitleH3 = document.createElement("h3");
    bookTitleH3.textContent = bookTitle;
    postDiv.appendChild(bookTitleH3);

    const authorDescription = document.createElement("p");
    const authorLabel = document.createElement("strong");
    authorLabel.textContent = "Author: ";
    authorDescription.appendChild(authorLabel);
    authorDescription.appendChild(document.createTextNode(author));
    postDiv.appendChild(authorDescription);

    const postContentDescription = document.createElement("p");
    postContentDescription.textContent = postContent;
    postDiv.appendChild(postContentDescription);

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    postDiv.appendChild(editButton);

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    postDiv.appendChild(deleteButton);

    postDiv.appendChild(userProfileDiv);
    postsList.appendChild(postDiv);

    postForm.reset();
  });
});
