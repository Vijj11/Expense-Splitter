
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';

function CreateExpense() {
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = new URLSearchParams(location.search).get('group');

  useEffect(() => {
    console.log('groupId:', groupId, 'location:', window.location.href);
  }, [groupId]);

  const [form, setForm] = useState({ description: '', amount: '', paid_by: '', split_among: [] });
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupError, setGroupError] = useState(null);

  useEffect(() => {
    if (!groupId) {
      setGroupError('No group selected. Please access this page from a group.');
      return;
    }
    api.get(`/groups/${groupId}/`).then(res => setGroupMembers(res.data.members)).catch(() => {
      setGroupError('Invalid group. Please check the group link or try again.');
    });
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.paid_by) {
      alert('Please select who paid for the expense.');
      return;
    }
    try {
      await api.post('/expenses/', { ...form, group: groupId });
      alert('Expense added!');
      navigate(`/expenses?group=${groupId}`);
    } catch (err) {
      let msg = err.response?.data?.error || err.response?.data?.detail || err.message || 'Error adding expense';
      if (err.response && err.response.data) {
        msg += '\n' + JSON.stringify(err.response.data, null, 2);
      }
      alert(`Error adding expense: ${msg}`);
      console.error('Expense creation error:', err);
    }
  };

  if (groupError) {
    return <Container className="mt-5 text-center"><Card className="p-4 mx-auto" style={{maxWidth:500}}><h3 style={{color:'red'}}>Error</h3><p>{groupError}</p></Card></Container>;
  }

  return (
    <Container>
      <Card className="p-4 mx-auto" style={{ maxWidth: 500 }}>
        <h3>Add Expense</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Amount</Form.Label>
            <Form.Control type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Paid By</Form.Label>
            <Form.Select value={form.paid_by} onChange={e => setForm({ ...form, paid_by: e.target.value })} required>
              <option value="">Select</option>
              {groupMembers.map(m => <option key={m.id} value={m.id}>{m.first_name ? m.first_name : m.username}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Split Among</Form.Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {groupMembers.map(m => (
                <Form.Check
                  key={m.id}
                  type="checkbox"
                  id={`split-among-${m.id}`}
                  label={m.first_name ? m.first_name : m.username}
                  value={m.id}
                  checked={form.split_among.includes(m.id.toString())}
                  onChange={e => {
                    const value = e.target.value;
                    setForm(prev => {
                      const alreadySelected = prev.split_among.includes(value);
                      return {
                        ...prev,
                        split_among: alreadySelected
                          ? prev.split_among.filter(v => v !== value)
                          : [...prev.split_among, value]
                      };
                    });
                  }}
                />
              ))}
            </div>
          </Form.Group>
          <Button type="submit">Add Expense</Button>
        </Form>
      </Card>
    </Container>
  );
}

export default CreateExpense;