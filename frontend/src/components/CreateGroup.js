import React, { useState, useContext } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';


function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Add the current user as a member when creating the group
      await api.post('/groups/', { name, description, members: [user.id] });
      alert('Group created!');
      navigate('/groups');
    } catch {
      alert('Error creating group');
    }
  };

  return (
    <Container>
      <Card className="p-4 mx-auto" style={{ maxWidth: 500 }}>
        <h3>Create Group</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control value={name} onChange={e => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Enter a description for your group"
            />
          </Form.Group>
          <Button type="submit">Create</Button>
        </Form>
      </Card>
    </Container>
  );
}

export default CreateGroup;