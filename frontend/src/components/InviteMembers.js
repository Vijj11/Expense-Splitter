import React, { useState } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';

function InviteMembers() {
  const { id } = useParams();
  const [phones, setPhones] = useState(['']);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (idx, value) => {
    const updated = [...phones];
    updated[idx] = value;
    setPhones(updated);
  };

  const addField = () => setPhones([...phones, '']);
  const removeField = idx => setPhones(phones.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      const res = await api.post('/groups/invite/', { group: id, phones });
      if (Array.isArray(res.data) && res.data.length === 0) {
        setError('No valid users found for the provided phone numbers.');
      } else {
        setSuccess('Invitations sent!');
        setPhones(['']);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send invites.');
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow mx-auto" style={{ maxWidth: 500 }}>
        <h3 className="mb-3">Invite Members by Phone</h3>
        <Form onSubmit={handleSubmit}>
          {phones.map((phone, idx) => (
            <Form.Group key={idx} className="mb-2">
              <Form.Label>Phone Number</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  value={phone}
                  onChange={e => handleChange(idx, e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
                {phones.length > 1 && (
                  <Button variant="danger" onClick={() => removeField(idx)}>-</Button>
                )}
              </div>
            </Form.Group>
          ))}
          <Button variant="secondary" onClick={addField} className="mb-3">+ Add Another</Button>
          <Button type="submit" variant="success" className="w-100">Send Invites</Button>
        </Form>
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        <Button variant="outline-primary" className="mt-3 w-100" onClick={() => navigate(-1)}>Back to Group</Button>
      </Card>
    </Container>
  );
}

export default InviteMembers;
