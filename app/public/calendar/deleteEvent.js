async function loadEventAndClubData() {
    try {
        const response = await fetch('/deleteEvents');
        if (!response.ok) throw new Error('Failed to fetch event and club data');

        const data = await response.json();

        const clubs = data.clubs;
        const clubSelect = document.getElementById('clubname');
        clubSelect.innerHTML = '<option value="">Please select your club\'s name</option>';

        clubs.forEach(club => {
            const option = document.createElement('option');
            option.value = club.name;
            option.textContent = club.name;
            clubSelect.appendChild(option);
        });

        clubSelect.addEventListener('change', async function () {
            const selectedClub = clubSelect.value;
            await populateEvents(selectedClub);
        });
    } catch (error) {
        console.error('Error loading event and club data:', error);
    }
}

async function populateEvents(clubName) {
    const eventSelect = document.getElementById('event');
    eventSelect.innerHTML = '<option value="">Please select an event</option>';

    if (!clubName) return;

    try {
        const response = await fetch(`/deleteEvents?clubName=${encodeURIComponent(clubName)}`);
        if (!response.ok) throw new Error('Failed to fetch events for the selected club');

        const data = await response.json();
        const events = data.events;

        events.forEach(event => {
            const option = document.createElement('option');
            option.value = event.title;
            option.textContent = event.title;
            eventSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating events:', error);
    }
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadEventAndClubData);
