async function loadEventAndClubData() {
    try {
        const response = await fetch('/clubEvents');
        if (!response.ok) throw new Error('Failed to fetch event and club data');

        const data = await response.json();

        const clubs = data.clubs;
        const clubSelect = document.getElementById('clubname');
        clubSelect.innerHTML = '<option value="">Please select the club\'s name</option>';

        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.name;
            option.textContent = club.name;
            clubSelect.appendChild(option);
        });

        clubSelect.addEventListener('change', async function () {
            const selectedClub = clubSelect.value;
            await displayEvents(selectedClub);
        });
    } catch (error) {
        console.error('Error loading event and club data:', error);
    }
}

async function displayEvents(clubName) {
    const displaySection = document.querySelector('.displayevents');
    displaySection.innerHTML = '';

    if (!clubName) {
        displaySection.textContent = 'Please select a club to view its events.';
        return;
    }

    try {
        const response = await fetch(`/clubEvents?clubName=${encodeURIComponent(clubName)}`);
        if (!response.ok) throw new Error('Failed to fetch events for the selected club');

        const data = await response.json();
        const events = data.events;

        if (events.length === 0) {
            displaySection.textContent = 'No events have been created for the selected club yet.';
            return;
        }

        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.innerHTML = `<strong><br>${event.title}</strong><br>&emsp;${event.starttime} - ${event.endtime}`;
            displaySection.appendChild(eventDiv);
        });
    } catch (error) {
        console.error('Error displaying events:', error);
        displaySection.textContent = 'Error loading events. Please try again.';
    }
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadEventAndClubData);
