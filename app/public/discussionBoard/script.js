document.addEventListener("DOMContentLoaded", function () {
  const postForm = document.getElementById("postForm");
  const postsList = document.getElementById("postsList");

  postForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const bookTitle = document.getElementById("bookTitle").value;
    const author = document.getElementById("author").value;
    const postContent = document.getElementById("postContent").value;

    const url = "/threads";

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        book_id: 2,
        user_account_id: 123,
        book_club_id: 11,
        title: bookTitle,
        comment: postContent,
      }),
    })
      .then((response) => {
        if (response.status == 200) {
          console.log("Success: Post submitted successfully.");
          return response.json();
        } else {
          console.log("Error: Failed to submit post.");
          throw new Error("Request failed");
        }
      })
      .then((body) => {
        console.log("Received response body", body);
        console.log("the id", body.thread_id);

        const postDiv = document.createElement("div");
        const userProfileDiv = document.createElement("div");

        const avatarImg = document.createElement("img");
        avatarImg.src = ""; // Placeholder image
        avatarImg.alt = "User Avatar";
        userProfileDiv.appendChild(avatarImg);

        const username = document.createElement("p");
        username.textContent = "rhn29"; // Placeholder username
        userProfileDiv.appendChild(username);

        postDiv.appendChild(userProfileDiv);

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
        editButton.addEventListener("click", () =>
          editPost(postDiv, postContentDescription, body.thread_id)
        );
        postDiv.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deletePost(postDiv, body.thread_id));
        postDiv.appendChild(deleteButton);

        const replyButton = document.createElement("button");
        replyButton.textContent = "Reply";
        replyButton.addEventListener("click", () => createReplyBox(postDiv, body.thread_id));
        postDiv.appendChild(replyButton);

        postsList.appendChild(postDiv);
        postForm.reset();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

  function editPost(postDiv, postContentDescription, threadId) {
    const currentContent = postContentDescription.textContent;
    const editTextarea = document.createElement("textarea");
    editTextarea.value = currentContent;
    postContentDescription.replaceWith(editTextarea);

    const saveButton = document.createElement("button");
    saveButton.textContent = "Save";
    saveButton.addEventListener("click", () => {
      postContentDescription.textContent = editTextarea.value;
      editTextarea.replaceWith(postContentDescription);
      console.log('threadId:', threadId); 
      console.log('new text:', editTextarea.value); 
      fetch(`/threads/${threadId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editTextarea.value,
        }),
      }).then((response) => {
        if (response.status === 200) {
          console.log("Post updated successfully.");
        } else {
          console.log("Failed to update post.");
        }
      });
      saveButton.remove();
    });

    postDiv.appendChild(saveButton);
  }

  function deletePost(postDiv, threadId) {
    postsList.removeChild(postDiv);
    fetch(`/threads/${threadId}`, {
      method: "DELETE",
    }).then((response) => {
      if (response.status === 200) {
        console.log("Post deleted successfully.");
      } else {
        console.log("Failed to delete post.");
      }
    });
  }

  function createReplyBox(postDiv, postId) {
    if (postDiv.querySelector(".replyBox")) return;

    const replyBox = document.createElement("div");

    const replyTextarea = document.createElement("textarea");
    replyTextarea.placeholder = "Write a reply...";
    replyBox.appendChild(replyTextarea);

    const submitReplyButton = document.createElement("button");
    submitReplyButton.textContent = "Submit Reply";
    submitReplyButton.addEventListener("click", () => {
      const replyContent = replyTextarea.value;
      if (replyContent.trim()) {
        addReply(postDiv, replyContent, postId);
        replyBox.remove();
      }
    });

    replyBox.appendChild(submitReplyButton);
    postDiv.appendChild(replyBox);
  }

  function addReply(postDiv, replyContent, postId) {
    const replyDiv = document.createElement("div");

    const replyText = document.createElement("p");
    replyText.textContent = replyContent;

    replyDiv.appendChild(replyText);
    postDiv.appendChild(replyDiv);

    fetch("/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        thread_id: postId,
        user_account_id: 123, 
        content: replyContent,
      }),
    }).then((response) => {
      if (response.status === 200) {
        console.log("Reply added successfully.");
      } else {
        console.log("Failed to add reply.");
      }
    });
  }
});
