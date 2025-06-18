// src/App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TransactionForm from './components/TransactionForm';
import './styles.css';
import SummaryChart from './components/SummaryChart';
import Papa from "papaparse";


const App = () => {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/transactions');
      setTransactions(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error fetching transactions:', error);
    }
  };

  const calculateSummary = () =>{
    let income = 0, expense = 0;
    transactions.forEach((txn)=>{
      if(txn.type === "income"){
        income += txn.amount;
      }
      else{
        expense += txn.amount;
      }
    });
    return{
      income,
      expense,
      balance: income-expense
    };
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleNewTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const handleDeleteTransaction = async(id)=>{
    const confirm = window.confirm("Are you sure you want to delete this transaction??");
    if (!confirm) return;

    try{
      await axios.delete(`http://localhost:5000/api/transactions/${id}`);
      setTransactions(transactions.filter(tx=>tx._id !== id));
    }
    catch(error){
      console.log("Error deleting transaction ",error);
    }
  };

  const { income, expense, balance } = calculateSummary();

  const filteredTransactions = transactions.filter((tx) =>
  filter === "all" ? true : tx.type === filter
);

const exportToCSV = () => {
  const csv = Papa.unparse(
    transactions.map(tx => ({
      Type: tx.type,
      Category:tx.category,
      Amount: tx.Amount,
      Date: new Date(tx.date).toLocaleDateString("en-GB"),
      Time: new Date(tx.date).toLocaleTimeString([],{hour: '2-digit', minute: '2-digit' }),
    }))
  );
  const blob = new Blob([csv],{type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download","transaction.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className={darkMode ? "app dark-mode" : "app"}>
    <div>
      <h1>💰 Personal Finance Tracker</h1>

      <button onClick={()=>setDarkMode(!darkMode)} className='dark-toggle'>
        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>

      <button onClick={exportToCSV} className='export-btn'>
        Export to CSV
      </button>

      <div className="main-section">
  <div className="summary-chart">
    <div className="summary-card">
      <div>
        <h3>Balance</h3>
        <p>₹{balance}</p>
      </div>
      <div>
        <h4>Income</h4>
        <p className="income">+ ₹{income}</p>
      </div>
      <div>
        <h4>Expense</h4>
        <p className="expense">- ₹{expense}</p>
      </div>
    </div>

    <SummaryChart income={income} expense={expense} />
  </div>

  <div className="add-transaction">
    <TransactionForm onTransactionAdded={handleNewTransaction} />
  </div>
</div>


      <h2>All Transactions</h2>
        <div className="filter-buttons" style={{ margin: "20px 0" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("income")}>Income</button>
        <button onClick={() => setFilter("expense")}>Expense</button>
      </div>

      {loading ? (
        <p>Loading Transaction...</p>
      ):(
      <ul>
  {transactions.map((tx) => (
    <li key={tx._id}>
      {tx.type} - {tx.category} - ₹{tx.amount}
      <br />
      <small style={{ color: '#777' }}>
        {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
      </small>
      <br />
      <button
        onClick={() => handleDeleteTransaction(tx._id)}
        style={{
          marginTop: "5px",
          backgroundColor: "#ff4d4d",
          color: "white",
          border: "none",
          padding: "4px 10px",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </li>
  ))}
</ul>

)}
    </div>
  </div>
  );
};


export default App;
