document.addEventListener('DOMContentLoaded', async () => {
    setTodayDate();
    const entries = await fetchEntries();
    renderEntries(entries);
    renderTotals(entries);
    initCalendar(entries);
    setupEventHandlers(entries);
});

async function fetchEntries() {
    const response = await fetch('/api/entries');
    const entries = await response.json();
    return entries;
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
    await fetch(`/api/entries/${id}`, {
        method: 'DELETE',
    });
}

function setTodayDate() {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const todayDateEl = document.getElementById('today-date');
    todayDateEl.textContent = `${formattedDate}, 오늘 나의 소비는?`;
}

function renderEntries(entries, date = null) {
    const entriesTableBody = document.querySelector('#entries-table tbody');
    entriesTableBody.innerHTML = '';
    entries.forEach(entry => {
        if (!date || entry.date === date) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.type === 'income' ? '수입' : '지출'}</td>
                <td>${entry.description}</td>
                <td class="${entry.type === 'income' ? 'income-amount' : 'expense-amount'}">${entry.type === 'income' ? '+' : '-'}${entry.amount}원</td>
                <td>
                    <button data-id="${entry.id}" class="update-btn">수정</button>
                    <button data-id="${entry.id}" class="delete-btn">삭제</button>
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
                        <button type="submit">저장</button>
                        <button type="button" class="close-btn">✕</button>
                    </form>
                </td>
            `;
            entriesTableBody.appendChild(updateRow);
        }
    });
}

function renderTotals(entries) {
    const totalIncome = entries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = entries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    const netAmount = totalIncome - totalExpense;

    document.getElementById('total-income').textContent = totalIncome.toLocaleString();
    document.getElementById('total-expense').textContent = totalExpense.toLocaleString();
    document.getElementById('net-amount').textContent = netAmount.toLocaleString();
}

function initCalendar(entries) {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'ko',
        events: entries.map(entry => ({
            title: `${entry.type === 'income' ? '수입' : '지출'}: ${entry.amount}원`,
            start: entry.date,
            color: entry.type === 'income' ? 'green' : 'red'
        }))
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
        renderTotals(entries);
        initCalendar(entries);
    });

    document.querySelector('#entries-table').addEventListener('click', async (event) => {
        if (event.target.classList.contains('delete-btn')) {
            const id = event.target.dataset.id;
            await deleteEntry(id);
            const entryIndex = entries.findIndex(entry => entry.id == id);
            entries.splice(entryIndex, 1);
            renderEntries(entries);
            renderTotals(entries);
            initCalendar(entries);
        } else if (event.target.classList.contains('update-btn')) {
            const id = event.target.dataset.id;
            const updateFormContainer = document.querySelector(`.update-form-container[data-id="${id}"]`);
            updateFormContainer.classList.toggle('visible');
        } else if (event.target.classList.contains('close-btn')) {
            const updateFormContainer = event.target.closest('.update-form-container');
            updateFormContainer.classList.remove('visible');
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
            const entryIndex = entries.findIndex(entry => entry.id == id);
            entries[entryIndex] = updated;
            renderEntries(entries);
            renderTotals(entries);
            initCalendar(entries);
        }
    });
}