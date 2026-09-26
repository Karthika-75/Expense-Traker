let transactions = [];


// Show today's date
const today = new Date();

document.getElementById("date").textContent =
    today.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });


// Load transactions when page opens
loadTransactions();


async function loadTransactions() {

    try {

        const response =
            await fetch("/api/transactions");

        transactions =
            await response.json();

        displayTransactions();

        updateSummary();

    } catch (error) {

        console.error("Error loading transactions:", error);

    }

}


// Add transaction
document.getElementById("expenseForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const description =
            document.getElementById("description").value.trim();

        const amount =
            Number(document.getElementById("amount").value);

        const type =
            document.getElementById("type").value;

        const category =
            document.getElementById("category").value;


        if (description === "" || amount <= 0) {

            alert("Please enter valid transaction details.");

            return;

        }


        const transaction = {

            description: description,

            amount: amount,

            type: type,

            category: category

        };


        try {

            const response = await fetch(
                "/api/transactions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(transaction)
                }
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to add transaction"
                );

            }


            document.getElementById(
                "expenseForm"
            ).reset();


            await loadTransactions();


        } catch (error) {

            console.error(
                "Error adding transaction:",
                error
            );

        }

    }
);


// Display transactions
function displayTransactions() {

    const list =
        document.getElementById("transactionList");

    const filter =
        document.getElementById("filter").value;


    let filteredTransactions =
        transactions;


    if (filter === "income") {

        filteredTransactions =
            transactions.filter(function(transaction) {

                return transaction.type === "income";

            });

    }


    if (filter === "expense") {

        filteredTransactions =
            transactions.filter(function(transaction) {

                return transaction.type === "expense";

            });

    }


    list.innerHTML = "";


    if (filteredTransactions.length === 0) {

        list.innerHTML =
            '<div class="empty-state">' +
                '<div class="empty-icon">💳</div>' +
                '<h3>No transactions found</h3>' +
                '<p>Add a transaction to get started.</p>' +
            '</div>';

        return;

    }


    filteredTransactions.forEach(function(transaction) {

        const item =
            document.createElement("div");

        item.className = "transaction";


        let icon = "📦";


        if (transaction.category === "Food") {
            icon = "🍔";
        }

        if (transaction.category === "Travel") {
            icon = "🚗";
        }

        if (transaction.category === "Shopping") {
            icon = "🛍️";
        }

        if (transaction.category === "Education") {
            icon = "📚";
        }

        if (transaction.category === "Bills") {
            icon = "🧾";
        }

        if (transaction.category === "Entertainment") {
            icon = "🎬";
        }


        const sign =
            transaction.type === "income"
                ? "+"
                : "-";


        item.innerHTML =

            '<div class="transaction-left">' +

                '<div class="category-icon">' +
                    icon +
                '</div>' +

                '<div>' +

                    '<div class="transaction-name">' +
                        transaction.description +
                    '</div>' +

                    '<div class="transaction-category">' +
                        transaction.category +
                    '</div>' +

                '</div>' +

            '</div>' +


            '<div class="transaction-right">' +

                '<strong class="' +
                    transaction.type +
                '">' +

                    sign +
                    "₹" +
                    Number(
                        transaction.amount
                    ).toLocaleString("en-IN") +

                '</strong>' +

                '<button class="delete-btn" ' +
                    'onclick="deleteTransaction(' +
                    transaction.id +
                    ')">' +

                    '🗑️' +

                '</button>' +

            '</div>';


        list.appendChild(item);

    });

}


// Delete transaction
async function deleteTransaction(id) {

    try {

        const response = await fetch(
            "/api/transactions/" + id,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Failed to delete transaction"
            );

        }


        await loadTransactions();


    } catch (error) {

        console.error(
            "Error deleting transaction:",
            error
        );

    }

}


// Update summary
function updateSummary() {

    let income = 0;

    let expense = 0;


    transactions.forEach(function(transaction) {

        if (transaction.type === "income") {

            income += Number(transaction.amount);

        } else {

            expense += Number(transaction.amount);

        }

    });


    const balance =
        income - expense;


    document.getElementById(
        "totalIncome"
    ).textContent =
        "₹" + income.toLocaleString("en-IN");


    document.getElementById(
        "totalExpense"
    ).textContent =
        "₹" + expense.toLocaleString("en-IN");


    document.getElementById(
        "balance"
    ).textContent =
        "₹" + balance.toLocaleString("en-IN");

}


// Filter transactions
document.getElementById("filter").addEventListener(
    "change",
    function() {

        displayTransactions();

    }
);