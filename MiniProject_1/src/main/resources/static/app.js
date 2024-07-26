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
                <td><button data-id="${entry.id}" class="delete-btn">삭제</button></td>
            `;
            entriesTableBody.appendChild(row);
        }
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const id = event.target.getAttribute('data-id');
            await deleteEntry(id);
            const updatedEntries = await fetchEntries();
            renderEntries(updatedEntries);
            renderTotals(updatedEntries);
        });
    });
}

function renderTotals(entries) {
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const netAmountEl = document.getElementById('net-amount');

    const totalIncome = entries.filter(entry => entry.type === 'income').reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpense = entries.filter(entry => entry.type === 'expense').reduce((sum, entry) => sum + entry.amount, 0);
    
    totalIncomeEl.textContent = totalIncome;
    totalExpenseEl.textContent = totalExpense;
    netAmountEl.textContent = totalIncome - totalExpense;
}

function setupEventHandlers(entries) {
    const form = document.getElementById('entry-form');
    
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const type = document.getElementById('type').value;
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;

        const newEntry = await addEntry({ type, description, amount, date });
        entries.push(newEntry);
        renderEntries(entries);
        renderTotals(entries);
    });

    document.getElementById('sort-date-asc').addEventListener('click', () => {
        entries.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderEntries(entries);
    });

    document.getElementById('sort-date-desc').addEventListener('click', () => {
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderEntries(entries);
    });

    document.getElementById('sort-amount-asc').addEventListener('click', () => {
        entries.sort((a, b) => a.amount - b.amount);
        renderEntries(entries);
    });

    document.getElementById('sort-amount-desc').addEventListener('click', () => {
        entries.sort((a, b) => b.amount - a.amount);
        renderEntries(entries);
    });
}

function initCalendar(entries) {
    const calendarEl = document.getElementById('calendar');
    
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: entries.map(entry => ({
            title: `${entry.type === 'income' ? '+' : '-'}${entry.amount}원`,
            start: entry.date,
            textColor: entry.type === 'income' ? 'green' : 'red'
        })),
        dateClick: function(info) {
            const filteredEntries = entries.filter(entry => entry.date === info.dateStr);
            renderEntries(filteredEntries);
        }
    });
    
    calendar.render();
}