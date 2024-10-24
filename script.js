let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Render the calendar
function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const month = currentMonth;
    const year = currentYear;

    // Clear the calendar before rendering
    calendar.innerHTML = '';

    // Set the title for the current month and year
    const title = document.createElement('h2');
    title.innerText = `${new Date(year, month).toLocaleString('default', { month: 'long' })} ${year}`;
    calendar.appendChild(title);

    // Create a table for the calendar
    const table = document.createElement('table');
    table.className = 'table table-bordered';

    // Create the header row
    const headerRow = document.createElement('tr');
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    days.forEach(day => {
        const th = document.createElement('th');
        th.innerText = day;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Get the first day of the month and the number of days in the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Create a new row for the calendar
    let row = document.createElement('tr');

    // Fill the first row with empty cells until the first day
    const firstDayOfWeek = (firstDay.getDay() + 7) % 7; // Adjust to start week on Monday
    for (let i = 0; i < firstDayOfWeek; i++) {
        const td = document.createElement('td');
        row.appendChild(td);
    }

    // Fill the calendar with days
    for (let day = 1; day <= daysInMonth; day++) {
        const td = document.createElement('td');
        td.innerText = day;
        td.className = 'calendar-day';

        // Highlight today's date
        if (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            td.style.border = '2px solid red'; // Highlight current day
        }

        // Event click handler
        td.onclick = function () {
            const eventDate = new Date(year, month, day);
            loadEventsForDay(eventDate);
        };

        row.appendChild(td);

        //
        if ((firstDayOfWeek + day) % 7 === 0) {
            table.appendChild(row);
            row = document.createElement('tr');
        }
    }
    table.appendChild(row);
    calendar.appendChild(table);
}

// Function to navigate to the previous month
document.getElementById('prevMonth').onclick = function() {
    if (currentMonth === 0) {
        currentMonth = 11; // December
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar();
};

// Function to navigate to the next month
document.getElementById('nextMonth').onclick = function() {
    if (currentMonth === 11) {
        currentMonth = 0; // January
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar();
};

// Load events for a specific day
function loadEventsForDay(eventDate) {
    const dateString = eventDate.toISOString().slice(0, 10);
    document.getElementById('event_date').value = dateString;

    // Clear existing events
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';

    fetch(`events.php?action=fetch&date=${dateString}`)
        .then(response => response.json())
        .then(data => {
            // Show events in the modal
            if (data.events.length > 0) {
                data.events.forEach(event => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item d-flex justify-content-between align-items-center';
                    li.innerText = event.title;

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn btn-warning btn-sm';
                    editBtn.innerText = 'Edit';
                    editBtn.onclick = function() {
                        openEventModal(event);
                    };

                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-danger btn-sm';
                    deleteBtn.innerText = 'Delete';
                    deleteBtn.onclick = function() {
                        deleteEvent(event.id);
                    };

                    li.appendChild(editBtn);
                    li.appendChild(deleteBtn);
                    eventList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerText = 'No events found for this date.';
                eventList.appendChild(li);
            }

            $('#eventModal').modal('show'); // Show modal with events
        });
}

// Open the event modal for adding or editing
function openEventModal(event) {
    if (event) {
        document.getElementById('title').value = event.title;
        document.getElementById('start_date').value = event.start_date;
        document.getElementById('end_date').value = event.end_date;
        document.getElementById('description').value = event.description;
        document.getElementById('isAnnual').checked = event.isAnnual === '1';

        document.getElementById('event_id').value = event.id; // Set event ID
        document.getElementById('deleteEventBtn').style.display = 'block'; // Show delete button
    } else {
        // Reset fields for a new event
        document.getElementById('title').value = '';
        document.getElementById('start_date').value = '';
        document.getElementById('end_date').value = '';
        document.getElementById('description').value = '';
        document.getElementById('isAnnual').checked = false;
        document.getElementById('event_id').value = ''; // Clear event ID
        document.getElementById('deleteEventBtn').style.display = 'none'; // Hide delete button
    }

    $('#eventModal').modal('show');
}

// Handle the event form submission
document.getElementById('eventForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('title').value;
    const start_date = document.getElementById('start_date').value;
    const end_date = document.getElementById('end_date').value;
    const description = document.getElementById('description').value;
    const isAnnual = document.getElementById('isAnnual').checked ? '1' : '0';
    const eventId = document.getElementById('event_id').value;

    const action = eventId ? 'update' : 'add'; // Determine if adding or updating

    fetch('events.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            action: action,
            title: title,
            start_date: start_date,
            end_date: end_date,
            description: description,
            isAnnual: isAnnual,
            id: eventId // Include event ID for updates
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            $('#eventModal').modal('hide');
            renderCalendar(); // Re-render the calendar to show the new event
            loadEvents(); // Load events after adding a new one
        } else {
            alert(data.message); // Show error message
        }
    });
});

// Handle the delete event
function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        fetch('events.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'delete',
                id: eventId,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                loadEventsForDay(new Date(currentYear, currentMonth, new Date().getDate())); // Refresh the events for the current date
            } else {
                alert(data.message); // Show error message
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {
    renderCalendar();
    loadEvents(); // Load events from the server
});

// Load events function
function loadEvents() {
    fetch('events.php?action=fetch')
        .then(response => response.json())
        .then(data => {
            console.log('Fetched events:', data); // API'den gelen verileri kontrol edin
            renderEvents(data.events, data.annual_events); // Etkinlikleri render et
        })
        .catch(error => {
            console.error('Error fetching events:', error);
        });
}

// Render the fetched events
function renderEvents(events, annual_events) {
    // Implement logic to render fetched events
}
