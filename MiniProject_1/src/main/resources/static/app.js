document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('entry-form');
    const entriesTableBody = document.querySelector('#entries-table tbody');
    const calendarEl = document.getElementById('calendar');

    const fetchEntries = async (date = null) => {
        const response = await fetch('/api/entries');
        const entries = await response.json();
        entriesTableBody.innerHTML = '';
        entries.forEach(entry => {
            if (!date || entry.date === date) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.date}</td>
                    <td>${entry.type === 'income' ? '수입' : '지출'}</td>
                    <td>${entry.description}</td>
                    <td>${entry.amount}원</td>
                    <td><button data-id="${entry.id}" class="delete-btn">삭제</button></td>
                `;
                entriesTableBody.appendChild(row);
            }
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', async (event) => {
                const id = event.target.getAttribute('data-id');
                await fetch(`/api/entries/${id}`, {
                    method: 'DELETE',
                });
                fetchEntries();
            });
        });
    };

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;

        const response = await fetch('/api/entries', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, description, amount, date }),
        });

        if (response.ok) {
            fetchEntries();
        }
    });

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: async function(fetchInfo, successCallback, failureCallback) {
            const response = await fetch('/api/entries');
            const entries = await response.json();
            const events = entries.map(entry => ({
                title: `${entry.type === 'income' ? '수입' : '지출'}: ${entry.description} - ${entry.amount}원`,
                start: entry.date
            }));
            successCallback(events);
        },
        dateClick: function(info) {
            fetchEntries(info.dateStr);
        }
    });

    calendar.render();
    fetchEntries();
});