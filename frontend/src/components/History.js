import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Container, Card, Table, Spinner } from 'react-bootstrap';

function History() {
  // Format date as dd/mm/yyyy and time as 12-hour with am/pm
  function formatDateTime(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d)) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  }
  const [loading, setLoading] = useState(true);
  const [paid, setPaid] = useState([]);
  const [received, setReceived] = useState([]);

  // Log paid data for debugging after state is initialized
  useEffect(() => {
    if (!loading) {
      console.log('Paid settlements:', paid);
    }
  }, [loading, paid]);

  // Helper to deduplicate settlements by all fields in the row
  // Helper to deduplicate settlements by normalized fields
  function deduplicatePaid(arr) {
    // Only show objects that have all required fields, then deduplicate
    const filtered = arr.filter(item => (
      item.amount !== undefined && item.group_name && item.date && (item.to_name || item.to)
    ));
    const seen = new Set();
    return filtered.filter(item => {
      const key = `${item.amount}|${item.group_name}|${item.date}|${item.to_name || item.to}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function deduplicateReceived(arr) {
    // Only show objects that have all required fields, then deduplicate
    const filtered = arr.filter(item => (
      item.amount !== undefined && item.group_name && item.date && (item.from_name || item.from)
    ));
    const seen = new Set();
    return filtered.filter(item => {
      const key = `${item.from_name || item.from}|${item.amount}|${item.group_name}|${item.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/history/');
        setPaid(res.data.paid || []);
        setReceived(res.data.received || []);
      } catch {
        setPaid([]);
        setReceived([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();

    // Listen for window focus to refresh if needed
    const handleFocus = () => {
      if (localStorage.getItem('historyNeedsRefresh') === 'true') {
        fetchHistory();
        localStorage.removeItem('historyNeedsRefresh');
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  return (
    <Container className="mt-4">
      <h3>History</h3>
      {loading ? <Spinner animation="border" /> : (
        <>
          <Card className="mb-4">
            <Card.Header style={{ background: '#1677ff', color: 'white', fontWeight: 'bold' }}>Paid</Card.Header>
            <Card.Body>
              {paid.length === 0 ? <div className="text-muted">No paid settlements.</div> : (
                <Table bordered hover>
                  <thead>
                    <tr><th>To</th><th>Amount</th><th>Group</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {deduplicatePaid(paid).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.to_name || item.to}</td>
                        <td>₹{item.amount}</td>
                        <td>{item.group_name}</td>
                        <td>{formatDateTime(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
          <Card>
            <Card.Header style={{ background: '#1677ff', color: 'white', fontWeight: 'bold' }}>Received</Card.Header>
            <Card.Body>
              {received.length === 0 ? <div className="text-muted">No received settlements.</div> : (
                <Table bordered hover>
                  <thead>
                    <tr><th>From</th><th>Amount</th><th>Group</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {deduplicateReceived(received).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.from_name || item.from}</td>
                        <td>₹{item.amount}</td>
                        <td>{item.group_name}</td>
                        <td>{formatDateTime(item.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default History;
