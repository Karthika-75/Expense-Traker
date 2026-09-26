from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)


# Connect to SQLite database
def get_db():
    conn = sqlite3.connect("expenses.db")
    conn.row_factory = sqlite3.Row
    return conn


# Create database table
def init_db():
    conn = get_db()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")


# Get all transactions
@app.route("/api/transactions", methods=["GET"])
def get_transactions():

    conn = get_db()

    transactions = conn.execute(
        "SELECT * FROM transactions ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        dict(transaction)
        for transaction in transactions
    ])


# Add transaction
@app.route("/api/transactions", methods=["POST"])
def add_transaction():

    data = request.json

    description = data.get("description")
    amount = data.get("amount")
    transaction_type = data.get("type")
    category = data.get("category")

    if not description or not amount:
        return jsonify({
            "error": "Invalid transaction"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO transactions
        (description, amount, type, category)
        VALUES (?, ?, ?, ?)
    """, (
        description,
        amount,
        transaction_type,
        category
    ))

    conn.commit()

    transaction_id = cursor.lastrowid

    conn.close()

    return jsonify({
        "id": transaction_id,
        "description": description,
        "amount": amount,
        "type": transaction_type,
        "category": category
    })


# Delete transaction
@app.route("/api/transactions/<int:transaction_id>",
           methods=["DELETE"])
def delete_transaction(transaction_id):

    conn = get_db()

    conn.execute(
        "DELETE FROM transactions WHERE id = ?",
        (transaction_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Transaction deleted"
    })


init_db()


if __name__ == "__main__":

    app.run(debug=True)
