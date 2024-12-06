let addButton = document.getElementById('addsubmit');
let addSuccessMessage = document.getElementById('addmessage');
addButton.addEventListener("click", async (event) => {
  // event.preventDefault();

  let userTitle = document.getElementById('addtitle').value;
  let userStart = Number(document.getElementById('addstart').value);
  console.log(document.getElementById('addstart'), 
    document.getElementById('addstart').value, 
    Number(document.getElementById('addstart')))
  let userEnd = Number(document.getElementById('addend').value);

  let dataToSend = { title: userTitle, startTime: userStart, endTime: userEnd };
  console.log(dataToSend, JSON.stringify(dataToSend))

  try {
      let response = await fetch('/events', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(dataToSend)
      });

      if (response.status === 200 || response.status === 201) {
        addSuccessMessage.textContent = 'Success';
      } else {
        addSuccessMessage.textContent = 'Bad request';
      }

  } catch (error) {
      console.error('Error:', error);
  }

  
});