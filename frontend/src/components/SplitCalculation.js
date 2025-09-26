import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Table, Button, Alert } from 'react-bootstrap';

function SplitCalculation() {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please log in to view split calculation.');
      return;
    }
  api.get(`/groups/${id}/split/`)
      .then(res => setResult(res.data))
      .catch(err => {
        if (err.response && err.response.status === 401) {
          setError('Session expired or unauthorized. Please log in again.');
        } else {
          setError('Failed to fetch split calculation.');
        }
      });
  }, [id]);

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow mx-auto" style={{ maxWidth: 600 }}>
        <h3 className="mb-3">Final Split Calculation</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {!result ? (
          <div className="text-center text-muted">Calculating split...</div>
        ) : (
          <>
            {(!result.settlements || result.settlements.length === 0) ? (
              <div className="text-muted text-center" style={{fontSize: '1.2em', margin: '2em 0'}}>All balances are settled.</div>
            ) : (
              <>
                <Table striped bordered hover responsive className="shadow-sm mt-3">
                  <thead className="table-success">
                    <tr>
                      <th>User</th>
                      <th>Net Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>You</td>
                      <td className={result.net_balance > 0 ? 'text-success' : result.net_balance < 0 ? 'text-danger' : ''}>
                        ₹{Math.abs(result.net_balance).toLocaleString('en-IN')}
                      </td>
                      <td>{result.status}</td>
                    </tr>
                  </tbody>
                </Table>
                <h5 className="mt-4">Settlements</h5>
                <Table striped bordered hover responsive className="shadow-sm mt-2">
                  <thead className="table-info">
                    <tr>
                      <th>Action</th>
                      <th>User</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let you = result.username;
                      if (!you) {
                        you = localStorage.getItem('username') || localStorage.getItem('user') || localStorage.getItem('phone') || '';
                      }
                      return result.settlements.map((s, idx) => {
                        const fromName = s.from_name || s.from;
                        const toName = s.to_name || s.to;
                        if (s.from === you) {
                          return (
                            <tr key={idx}>
                              <td>You pay</td>
                              <td>{toName}</td>
                              <td className="text-danger">₹{Math.abs(s.amount).toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        } else if (s.to === you) {
                          return (
                            <tr key={idx}>
                              <td>Pays you</td>
                              <td>{fromName}</td>
                              <td className="text-success">₹{Math.abs(s.amount).toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        } else {
                          return null;
                        }
                      });
                    })()}
                  </tbody>
                </Table>
              </>
            )}
          </>
        )}
        <Button variant="outline-primary" className="mt-3 w-100" onClick={() => navigate(-1)}>Back to Group</Button>
      </Card>
    </Container>
  );
}

export default SplitCalculation;
