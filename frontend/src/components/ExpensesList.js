import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useLocation, Link } from 'react-router-dom';
import { Table, Button, Container } from 'react-bootstrap';

function ExpensesList() {
  const [search, setSearch] = useState("");
  const [filterPayer, setFilterPayer] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);

  // MOCK: Add a fake settlement for testing removal
  useEffect(() => {
    if (settlements.length === 0 && expenses.length > 0) {
      // Mark the first expense as settled
      setSettlements([{ expense_id: expenses[0].id }]);
    }
  }, [expenses]);
  useEffect(() => {
    if (expenses.length > 0 || settlements.length > 0) {
      console.log('Expenses:', expenses);
      console.log('Settlements:', settlements);
    }
  }, [expenses, settlements]);
  const groupId = new URLSearchParams(useLocation().search).get('group');

  useEffect(() => {
    if (!groupId) return;
    api.get(`/expenses/?group=${groupId}`).then(res => setExpenses(res.data));
    api.get(`/groups/${groupId}/settlements/`).then(res => setSettlements(res.data.settlements || []));
  }, [groupId]);

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${expenseId}/`);
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
      } catch (err) {
        alert('Failed to delete expense.');
      }
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Group Expenses</h2>
        <div>
          <Button as={Link} to={`/groups/${groupId}/split`} variant="info" className="me-2">View Final Split</Button>
          <Button as={Link} to={`/expenses/create?group=${groupId}`} variant="success">+ Add Expense</Button>
        </div>
      </div>
      <div className="mb-3 d-flex flex-wrap gap-3 align-items-center">
        <input type="text" className="form-control" style={{maxWidth:200}} placeholder="Search by description" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{maxWidth:160}} value={filterPayer} onChange={e => setFilterPayer(e.target.value)}>
          <option value="">All Payers</option>
          {expenses.map(e => e.paid_by_details).filter((v,i,a)=>v&&a.findIndex(x=>x.id===v.id)===i).map(p => (
            <option key={p.id} value={p.id}>{p.first_name || p.username}</option>
          ))}
        </select>
        <select className="form-select" style={{maxWidth:160}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-primary">
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split Among</th>
            <th>Created At</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted">No expenses yet. Add your first expense!</td>
            </tr>
          ) : (
            expenses
              .filter(exp => {
                // Filter by search
                const searchLower = search.toLowerCase();
                const matchesSearch =
                  exp.description?.toLowerCase().includes(searchLower);
                // Filter by payer
                const matchesPayer = !filterPayer || (exp.paid_by_details && exp.paid_by_details.id.toString() === filterPayer);
                  return matchesSearch && matchesPayer;
              })
              .sort((a, b) => {
                if (sortBy === "amount") return b.amount - a.amount;
                if (sortBy === "date") return new Date(b.created_at) - new Date(a.created_at);
                return 0;
              })
              .map(exp => (
                <tr key={exp.id}>
                  <td className="align-middle">{exp.description}</td>
                  <td className="align-middle text-success fw-bold">₹{exp.amount}</td>
                  <td className="align-middle">
                    {exp.paid_by_details ? (
                      <span className="badge bg-info text-dark p-2">{exp.paid_by_details.first_name || exp.paid_by_details.username}</span>
                    ) : ''}
                  </td>
                  <td className="align-middle">
                    {exp.shares ? exp.shares.map(s => (
                      <span key={s.user.id} className="badge bg-light text-dark border me-1">
                        {s.user.first_name || s.user.username} <span className="text-primary">({s.share_amount})</span>
                      </span>
                    )) : ''}
                  </td>
                  <td className="align-middle text-secondary" style={{ fontSize: '0.95em' }}>
                    {exp.created_at ? (() => {
                      const d = new Date(exp.created_at);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      let hours = d.getHours();
                      const minutes = String(d.getMinutes()).padStart(2, '0');
                      const ampm = hours >= 12 ? 'PM' : 'AM';
                      hours = hours % 12;
                      hours = hours ? hours : 12; // the hour '0' should be '12'
                      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
                    })() : ''}
                  </td>
                  <td className="align-middle">
                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(exp.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default ExpensesList;

