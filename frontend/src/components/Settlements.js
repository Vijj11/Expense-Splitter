import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Container, Table, Button, Card, Spinner } from 'react-bootstrap';

function Settlements() {
  // Get user profile from API for accurate matching
  const [profile, setProfile] = useState({ username: '', first_name: '', last_name: '' });
  useEffect(() => {
    api.get('/users/profile/').then(res => setProfile(res.data));
  }, []);
  const currentUsername = (profile.username || '').trim().toLowerCase();
  const currentFirstName = (profile.first_name || '').trim().toLowerCase();
  const missingUserInfo = !currentUsername && !currentFirstName;
  const [settlementsByGroup, setSettlementsByGroup] = useState({});
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSettlement, setSelectedSettlement] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  useEffect(() => {
    const fetchGroupsAndSettlements = async () => {
      try {
  const groupsRes = await api.get('/groups/');
  // The response is a direct array, not { groups: [...] }
  const groupsData = Array.isArray(groupsRes.data) ? groupsRes.data : [];
  setGroups(groupsData);
  let settlementsObj = {};
  for (const group of groupsData) {
          try {
            const settlementsRes = await api.get(`/groups/${group.id}/settlements/`);
            settlementsObj[group.id] = settlementsRes.data.settlements || [];
          } catch {
            settlementsObj[group.id] = [];
          }
        }
        setSettlementsByGroup(settlementsObj);
      } catch {
        alert('Error fetching groups or settlements');
      } finally {
        setLoading(false);
      }
    };
    fetchGroupsAndSettlements();
  }, []);

  const handlePaymentConfirm = async () => {
    console.log('Confirm button clicked', { selectedGroup, selectedSettlement });
    if (!selectedGroup || !selectedSettlement) return;
    // Find the full settlement object by composite key
    const [from, to, amount] = selectedSettlement.split('|');
    const settlementObj = (settlementsByGroup[selectedGroup] || []).find(s =>
      String(s.from) === from && String(s.to) === to && String(s.amount) === amount
    );
    if (!settlementObj) {
      alert('Settlement not found');
      return;
    }
    // Debug: log the full settlementObj
    console.log('settlementObj:', settlementObj);
    // Build username to user ID map for this group
    const groupObj = groups.find(g => g.id === selectedGroup);
    let usernameToId = {};
    if (groupObj && groupObj.members) {
      groupObj.members.forEach(m => {
        if (m.username) usernameToId[m.username] = m.id;
      });
    }
    // Always use user IDs for from_user and to_user
    const postData = {
      from_user: settlementObj.from_user || settlementObj.from_user_id || usernameToId[settlementObj.from],
      to_user: settlementObj.to_user || settlementObj.to_user_id || usernameToId[settlementObj.to],
      amount: settlementObj.amount,
      payment_method: paymentMethod,
    };
    console.log('POST data:', postData);
    console.log('Settle POST', `/groups/${selectedGroup}/settlements/`, postData);
    try {
      const resp = await api.post(`/groups/${selectedGroup}/settlements/`, postData);
      console.log('Settle response', resp);
      const res = await api.get(`/groups/${selectedGroup}/settlements/`);
      setSettlementsByGroup(prev => ({
        ...prev,
        [selectedGroup]: res.data.settlements || [],
      }));
      // Set flag for history refresh
      localStorage.setItem('historyNeedsRefresh', 'true');
      // Force history page to refetch immediately if open
      window.dispatchEvent(new Event('focus'));
      setShowPaymentDialog(false);
      setSelectedGroup(null);
      setSelectedSettlement(null);
      setPaymentMethod('cash');
      alert('Settled!');
    } catch (err) {
      console.error('Settle error', err?.response || err);
      alert('Error settling up: ' + (err?.response?.data?.detail || err?.message || 'Unknown error'));
    }
  };

  const handleSettle = (groupId, settlementKey) => {
    console.log('Settle button clicked', { groupId, settlementKey });
    if (!settlementKey) {
      console.error('handleSettle called with undefined settlementKey!');
    }
    setSelectedGroup(groupId);
    setSelectedSettlement(settlementKey);
    setShowPaymentDialog(true);
  };

  return (
    <Container className="mt-4">
      {missingUserInfo && (
        <div style={{ color: 'red', fontWeight: 'bold', marginBottom: 16 }}>
          Please log in again or set your username in localStorage for settlements to work correctly.
        </div>
      )}
      <h3>Settlements</h3>

      {loading ? (
        <Spinner animation="border" />
      ) : groups.length === 0 ? (
        <div className="text-muted">No groups found.</div>
      ) : (
        groups.map(group => (
          <Card className="mb-4" key={group.id} style={{ border: 'none', background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Card.Header style={{ background: '#1677ff', color: 'white', fontWeight: 'bold', fontSize: '1.25rem', border: 'none', borderRadius: '8px 8px 0 0' }}>
              {group.name}
            </Card.Header>
            <Card.Body style={{ background: 'white', borderRadius: '0 0 8px 8px', padding: 0 }}>
              {settlementsByGroup[group.id] && settlementsByGroup[group.id].length > 0 ? (
                <Table style={{ margin: 0, background: 'white', border: '1px solid #e0e0e0' }}>
                  <thead>
                    <tr style={{ background: 'white' }}>
                      <th style={{ fontWeight: 'bold', color: 'black', borderBottom: '2px solid #e0e0e0' }}>From</th>
                      <th style={{ fontWeight: 'bold', color: 'black', borderBottom: '2px solid #e0e0e0' }}>To</th>
                      <th style={{ fontWeight: 'bold', color: 'black', borderBottom: '2px solid #e0e0e0' }}>Amount</th>
                      <th style={{ fontWeight: 'bold', color: 'black', borderBottom: '2px solid #e0e0e0' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlementsByGroup[group.id].map((s, idx) => {
                      // Debug log for matching logic and settlement object
                      const settlementKey = `${s.from}|${s.to}|${s.amount}`;
                      console.log('ROW settlementKey:', settlementKey, s);
                      // Composite key: from|to|amount (should be unique per group)
                      return (
                        <tr key={settlementKey} style={{ background: idx % 2 === 0 ? '#f6f6f6' : 'white' }}>
                          <td>{s.from_name || s.from}</td>
                          <td>{s.to_name || s.to}</td>
                          <td style={{ fontWeight: 'bold' }}>₹{s.amount}</td>
                          <td>
                            {((currentUsername && String(s.from || '').trim().toLowerCase() === currentUsername) ||
                              (currentUsername && String(s.from_name || '').trim().toLowerCase() === currentUsername) ||
                              (currentFirstName && String(s.from_name || '').trim().toLowerCase() === currentFirstName)) ? (
                              <Button
                                variant="primary"
                                style={{ fontWeight: 'bold', background: '#1677ff', border: 'none', borderRadius: 8 }}
                                onClick={() => handleSettle(group.id, settlementKey)}
                              >
                                Settle
                              </Button>
                            ) : (
                              <span style={{ fontWeight: 'bold', color: '#888' }}>Pending</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <div className="text-muted" style={{ background: '#f6f6f6', padding: 16, borderRadius: 8 }}>All settled up in this group!</div>
              )}
            </Card.Body>
          </Card>
        ))
      )}

      {/* Payment Method Dialog */}
      {showPaymentDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.3)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'white',
              padding: 30,
              borderRadius: 8,
              minWidth: 300,
            }}
          >
            <h5>Select Payment Method</h5>
            <select
              className="form-select my-3"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
            <div className="d-flex gap-2 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPaymentDialog(false);
                  setSelectedGroup(null);
                  setSelectedSettlement(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={handlePaymentConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default Settlements;
