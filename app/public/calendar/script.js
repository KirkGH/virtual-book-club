let addButton = document.getElementById('addsubmit');
let addSuccessMessage = document.getElementById('addmessage');
addButton.addEventListener("click", async (event) => {
  // event.preventDefault();

  let userClub = document.getElementById('clubname').value;
  let userTitle = document.getElementById('addtitle').value;
  let userStart = document.getElementById('addstart').value;
  //console.log(document.getElementById('addstart'), 
  //  document.getElementById('addstart').value)
  let userEnd = document.getElementById('addend').value;

  let dataToSend = { club: userClub, title: userTitle, startTime: userStart, endTime: userEnd };
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

async function loadEventAndClubData() {
    try {
        const response = await fetch('/events'); // No need for full URL if hosted on the same domain/port
        if (!response.ok) throw new Error('Failed to fetch event and club data');
        
        const data = await response.json();
        
        const clubs = data.clubs;
        const clubSelect = document.getElementById('clubname');

        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.name;
            option.textContent = club.name;
            clubSelect.appendChild(option);
        });

        const events = data.events;
        console.log('Events:', events);
    } catch (error) {
        console.error('Error loading event and club data:', error);
    }
}
// Load data on page load
document.addEventListener('DOMContentLoaded', loadEventAndClubData);