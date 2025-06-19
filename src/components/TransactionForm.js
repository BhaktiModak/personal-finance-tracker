import React, { useState } from 'react';
import axios from 'axios';

// ✅ Use environment variable for backend URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TransactionForm = ({ onTransactionAdded }) => {
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/transactions`, {
        type,
        category,
        amount: Number(amount),
      });
      onTransactionAdded(response.data); // notify parent
      setCategory('');
      setAmount('');
    } catch (error) {
      console.error("Error creating transaction", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Transaction</h2>
      <label>
        Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>
        Category:
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </label>
      <label>
        Amount:
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </label>
      <button type="submit">Add</button>
    </form>
  );
};

export default TransactionForm;
