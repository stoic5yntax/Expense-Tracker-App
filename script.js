class Expense {
  constructor(id, category, amount, timestamp, note) {
    this.id = id;
    this.category = category;
    this.amount = amount;
    this.timestamp = timestamp; // date only
    this.note = note;
  }
}

// ===== FORM ELEMENTS =====
const expenseForm = document.getElementById("transaction-form");
const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const categorySelect = document.getElementById("category");
const noteInput = document.getElementById("note");

// ===== SUMMARY ELEMENTS =====
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expensesEl = document.getElementById("expenses");
const clearBtn = document.getElementById("clear-btn");

// ===== TRANSACTION HISTORY =====
const transactionList = document.getElementById("transaction-list");

// ===== APP STATE =====
let userData = JSON.parse(localStorage.getItem("userData")) || [];
let income = Number(localStorage.getItem("income")) || null;

// ===== FUNCTIONS =====
const formatCurrency = (num) =>
  num.toLocaleString("en-IN", { style: "currency", currency: "INR" });

const updateSummary = () => {
  const totalExpenses = userData.reduce((sum, exp) => sum + exp.amount, 0);
  expensesEl.textContent = formatCurrency(totalExpenses);

  const balance = income - totalExpenses;
  balanceEl.textContent = formatCurrency(balance);

  // Balance color
  balanceEl.style.color = balance < 0 ? "#e65757" : "#4bd151";
};

const groupByDate = () => {
  const grouped = {};
  userData.forEach((exp) => {
    if (!grouped[exp.timestamp]) grouped[exp.timestamp] = [];
    grouped[exp.timestamp].push(exp);
  });
  return grouped;
};

const renderTransactions = () => {
  transactionList.innerHTML = "";

  if (userData.length === 0) {
    transactionList.innerHTML = "<li>No transactions yet.</li>";
    return;
  }

  const grouped = groupByDate();
  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  sortedDates.forEach((date) => {
    // Create a container for each date
    const dateContainer = document.createElement("div");
    dateContainer.classList.add("date-group");

    // Date heading
    const dateHeader = document.createElement("div");
    dateHeader.classList.add("transaction-date");
    dateHeader.textContent = date;
    dateContainer.appendChild(dateHeader);

    // Transactions under this date
    grouped[date].forEach((exp) => {
      const li = document.createElement("div");
      li.classList.add("transaction-item");

      li.innerHTML = `
        <div class="transaction-left">
          <span>${exp.category}</span>
          <span class="transaction-note">${exp.note || ""}</span>
        </div>
        <div class="transaction-amount">- ${formatCurrency(exp.amount)}</div>
      `;

      dateContainer.appendChild(li);
    });

    transactionList.appendChild(dateContainer);
  });
};

// Ask income only if not stored
const getTotalIncome = () => {
  if (!income) {
    const entered = Number(prompt("Please enter your total income!"));
    if (!entered || entered <= 0) {
      alert("Invalid income. Please refresh and try again.");
      return;
    }
    income = entered;
    localStorage.setItem("income", income);
  }
  incomeEl.textContent = formatCurrency(income);
  updateSummary();
};

// ===== EVENT LISTENERS =====
// Add expense
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = Date.now();
  const category = categorySelect.value.trim();
  const amount = Number(amountInput.value);
  const timestamp = new Date(dateInput.value).toLocaleDateString("en-GB");
  const note = noteInput.value.trim();

  if (!category || !amount || amount <= 0 || !dateInput.value) {
    alert("Please enter valid details!");
    return;
  }

  const newExpense = new Expense(id, category, amount, timestamp, note);
  userData.push(newExpense);

  renderTransactions();
  updateSummary();
  expenseForm.reset();
});

// Clear all data
clearBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all data?")) {
    userData = [];
    income = null;
    localStorage.removeItem("userData");
    localStorage.removeItem("income");

    balanceEl.textContent = formatCurrency(0);
    incomeEl.textContent = formatCurrency(0);
    expensesEl.textContent = formatCurrency(0);
    transactionList.innerHTML = "<li>No transactions yet.</li>";

    setTimeout(() => {
      getTotalIncome(); // prompt again for new income
    }, 1200);
  }
});

// ===== INIT =====
document.addEventListener("DOMContentLoaded", () => {
  renderTransactions();
  getTotalIncome();
});
