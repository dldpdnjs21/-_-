document.addEventListener('DOMContentLoaded', async () => {
    setTodayDate();
    let entries = await fetchEntries();
    renderEntries(entries);
    initCalendar(entries);
    setupEventHandlers(entries);
});

async function fetchEntries() {
    const response = await fetch('/api/entries');
    return await response.json();
}

async function addEntry(entry) {
    const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
    });
    return await response.json();
}

async function updateEntry(id, entry) {
    const response = await fetch(`/api/entries/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
    });
    return await response.json();
}

async function deleteEntry(id) {
    await fetch(`/api/entries/${id}`, { method: 'DELETE' });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('today-date').textContent = `${today}, 오늘 나의 소비는?`;
}

function renderEntries(entries, date = null, sortBy = 'date', sortOrder = 'asc') {
    const entriesTableBody = document.querySelector('#entries-table tbody');
    entriesTableBody.innerHTML = '';

    entries.sort((a, b) => {
        if (sortBy === 'date') {
            return sortOrder === 'asc' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date);
        } else if (sortBy === 'amount') {
            return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
    });

    entries.forEach(entry => {
        if (!date || entry.date === date) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.type === 'income' ? '수입' : '지출'}</td>
                <td>${entry.description}</td>
                <td class="${entry.type === 'income' ? 'income-amount' : 'expense-amount'}">
                    ${entry.type === 'income' ? '+' : '-'}${entry.amount}원
                </td>
                <td>
                    <button data-id="${entry.id}" class="update-btn btn-edit">수정</button>
                    <button data-id="${entry.id}" class="delete-btn btn-delete">삭제</button>
                </td>
            `;
            entriesTableBody.appendChild(row);

            const updateRow = document.createElement('tr');
            updateRow.classList.add('update-form-container');
            updateRow.dataset.id = entry.id;
            updateRow.innerHTML = `
                <td colspan="5">
                    <form class="update-form">
                        <input type="date" value="${entry.date}">
                        <select>
                            <option value="income" ${entry.type === 'income' ? 'selected' : ''}>수입</option>
                            <option value="expense" ${entry.type === 'expense' ? 'selected' : ''}>지출</option>
                        </select>
                        <input type="text" value="${entry.description}">
                        <input type="number" value="${entry.amount}">
                        <button type="submit" class="btn-update"><i class="fas fa-save"></i></button>
                    </form>
                </td>
            `;
            entriesTableBody.appendChild(updateRow);
        }
    });
}

function renderMonthSummary(entries, startDate, endDate) {
    const monthlyIncome = entries.filter(entry => entry.type === 'income' &&
        new Date(entry.date) >= startDate &&
        new Date(entry.date) <= endDate)
        .reduce((sum, entry) => sum + entry.amount, 0);

    const monthlyExpense = entries.filter(entry => entry.type === 'expense' &&
        new Date(entry.date) >= startDate &&
        new Date(entry.date) <= endDate)
        .reduce((sum, entry) => sum + entry.amount, 0);

    const netMonth = monthlyIncome - monthlyExpense;

    document.getElementById('month-income').textContent = monthlyIncome.toLocaleString();
    document.getElementById('month-expense').textContent = monthlyExpense.toLocaleString();
    document.getElementById('month-net').textContent = netMonth.toLocaleString();
}

function initCalendar(entries) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        events: entries.map(entry => ({
            title: `${entry.type === 'income' ? '+' : '-'} ${entry.amount}원`,
            start: entry.date,
            color: entry.type === 'income' ? 'green' : 'red'
        })),
        datesSet: (info) => {
            const startDate = new Date(info.view.currentStart);
            const endDate = new Date(info.view.currentEnd);
            endDate.setDate(endDate.getDate() - 1);
            renderMonthSummary(entries, startDate, endDate);
        }
    });
    calendar.render();
}

function setupEventHandlers(entries) {
    document.getElementById('entry-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const newEntry = {
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            description: document.getElementById('description').value,
            amount: parseInt(document.getElementById('amount').value)
        };
        const savedEntry = await addEntry(newEntry);
        entries.push(savedEntry);
        renderEntries(entries);
        initCalendar(entries);
    });

    document.querySelector('#entries-table').addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) return;

        const id = button.dataset.id;
        if (button.classList.contains('delete-btn')) {
            await deleteEntry(id);
            entries = entries.filter(entry => entry.id != id);
            renderEntries(entries);
            initCalendar(entries);
        } else if (button.classList.contains('update-btn')) {
            document.querySelector(`.update-form-container[data-id="${id}"]`).classList.toggle('visible');
        } else if (button.classList.contains('close-btn')) {
            document.querySelector(`.update-form-container[data-id="${id}"]`).classList.remove('visible');
        }
    });

    document.querySelector('#entries-table').addEventListener('submit', async (event) => {
        if (event.target.classList.contains('update-form')) {
            event.preventDefault();
            const updateFormContainer = event.target.closest('.update-form-container');
            const id = updateFormContainer.dataset.id;
            const updatedEntry = {
                date: event.target.querySelector('input[type="date"]').value,
                type: event.target.querySelector('select').value,
                description: event.target.querySelector('input[type="text"]').value,
                amount: parseInt(event.target.querySelector('input[type="number"]').value)
            };
            const updated = await updateEntry(id, updatedEntry);
            const index = entries.findIndex(entry => entry.id == id);
            entries[index] = updated;
            renderEntries(entries);
            initCalendar(entries);
        }
    });

    document.getElementById('sort-date-asc').addEventListener('click', () => {
        renderEntries(entries, null, 'date', 'asc');
    });

    document.getElementById('sort-date-desc').addEventListener('click', () => {
        renderEntries(entries, null, 'date', 'desc');
    });

    document.getElementById('sort-amount-asc').addEventListener('click', () => {
        renderEntries(entries, null, 'amount', 'asc');
    });

    document.getElementById('sort-amount-desc').addEventListener('click', () => {
        renderEntries(entries, null, 'amount', 'desc');
    });
}