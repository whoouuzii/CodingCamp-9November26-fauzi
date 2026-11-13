document.addEventListener('DOMContentLoaded', () => {
    // State
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || ['Food', 'Transport', 'Fun'];
    let currentTheme = localStorage.getItem('theme') || 'light';

    // DOM Elements
    const totalBalanceEl = document.getElementById('totalBalance');
    const transactionForm = document.getElementById('transactionForm');
    const itemNameInput = document.getElementById('itemName');
    const itemAmountInput = document.getElementById('itemAmount');
    const itemCategorySelect = document.getElementById('itemCategory');
    const transactionListEl = document.getElementById('transactionList');
    const customCategoryNameInput = document.getElementById('customCategoryName');
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const sortControl = document.getElementById('sortControl');
    const themeToggleBtn = document.getElementById('themeToggle');

    let spendingChart = null;

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButtonText();

    // Initialize App
    updateCategoriesDropdown();
    renderApp();

    // Event Listeners
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = itemNameInput.value.trim();
        const amount = parseFloat(itemAmountInput.value);
        const category = itemCategorySelect.value;

        if (!name || isNaN(amount) || amount <= 0 || !category) {
            alert('Please fill in all fields correctly.');
            return;
        }

        const newTransaction = {
            id: Date.now(),
            name,
            amount,
            category
        };

        transactions.push(newTransaction);
        saveAndRender();
        transactionForm.reset();
    });

    addCategoryBtn.addEventListener('click', () => {
        const newCat = customCategoryNameInput.value.trim();
        if (!newCat) return;
        if (categories.includes(newCat)) {
            alert('Category already exists!');
            return;
        }
        categories.push(newCat);
        localStorage.setItem('categories', JSON.stringify(categories));
        updateCategoriesDropdown();
        customCategoryNameInput.value = '';
    });

    sortControl.addEventListener('change', () => {
        renderTransactions();
    });

    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        updateThemeButtonText();
        if (spendingChart) {
            updateChartColors();
        }
    });

    function updateThemeButtonText() {
        themeToggleBtn.textContent = currentTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
    }

    window.deleteTransaction = function(id) {
        transactions = transactions.filter(t => t.id !== id);
        saveAndRender();
    };

    function saveAndRender() {
        localStorage.setItem('transactions', JSON.stringify(transactions));
        renderApp();
    }

    function updateCategoriesDropdown() {
        const currentSelected = itemCategorySelect.value;
        itemCategorySelect.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            itemCategorySelect.appendChild(option);
        });
        if (categories.includes(currentSelected)) {
            itemCategorySelect.value = currentSelected;
        }
    }

    function renderApp() {
        renderBalance();
        renderTransactions();
        renderChart();
    }

    function renderBalance() {
        const total = transactions.reduce((acc, t) => acc + t.amount, 0);
        totalBalanceEl.textContent = `$${total.toFixed(2)}`;
    }

    function getSortedTransactions() {
        const sortBy = sortControl.value;
        let sorted = [...transactions];

        if (sortBy === 'amount-desc') {
            sorted.sort((a, b) => b.amount - a.amount);
        } else if (sortBy === 'amount-asc') {
            sorted.sort((a, b) => a.amount - b.amount);
        } else if (sortBy === 'category') {
            sorted.sort((a, b) => a.category.localeCompare(b.category));
        } else {
            sorted.sort((a, b) => b.id - a.id);
        }
        return sorted;
    }

    function renderTransactions() {
        const sorted = getSortedTransactions();
        transactionListEl.innerHTML = '';

        if (sorted.length === 0) {
            transactionListEl.innerHTML = '<p class="empty-msg">No transactions added yet.</p>';
            return;
        }

        sorted.forEach(t => {
            const itemEl = document.createElement('div');
            itemEl.className = 'transaction-item';
            itemEl.innerHTML = `
                <div class="transaction-info">
                    <h4>${escapeHtml(t.name)}</h4>
                    <span>${escapeHtml(t.category)}</span>
                </div>
                <div class="transaction-amount-del">
                    <span class="transaction-amount">$${t.amount.toFixed(2)}</span>
                    <button class="btn-delete" onclick="deleteTransaction(${t.id})">Delete</button>
                </div>
            `;
            transactionListEl.appendChild(itemEl);
        });
    }

    function renderChart() {
        const ctx = document.getElementById('spendingChart').getContext('2d');
        
        const categoryTotals = {};
        categories.forEach(cat => categoryTotals[cat] = 0);
        transactions.forEach(t => {
            if (categoryTotals[t.category] !== undefined) {
                categoryTotals[t.category] += t.amount;
            } else {
                categoryTotals[t.category] = t.amount;
            }
        });

        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        const backgroundColors = [
            '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'
        ];

        if (spendingChart) {
            spendingChart.data.labels = labels;
            spendingChart.data.datasets[0].data = data;
            spendingChart.update();
            return;
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        spendingChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: isDark ? '#e0e0e0' : '#333333'
                        }
                    }
                }
            }
        });
    }

    function updateChartColors() {
        if (!spendingChart) return;
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        spendingChart.options.plugins.legend.labels.color = isDark ? '#e0e0e0' : '#333333';
        spendingChart.update();
    }

    function escapeHtml(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&', '<': '<', '>': '>', "'": '′', '"': '"'}[tag] || tag)
        );
    }
});