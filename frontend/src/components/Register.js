import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';

function Register() {
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await api.post('/users/register/', {
        username: form.phone,
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        password2: form.password2
      });
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        const errMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        setError('Registration failed: ' + errMsg);
      } else {
        setError('Registration failed. Please check your details.');
      }
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="text-center mb-3">Create Account</h2>
        <p className="text-center mb-4">Join SplitEase and start splitting expenses easily!</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>First Name</Form.Label>
            <Form.Control name="first_name" value={form.first_name} onChange={handleChange} required placeholder="First Name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last Name (optional)" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control name="phone" value={form.phone} onChange={handleChange} required placeholder="Mobile Number" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control name="password2" type="password" value={form.password2} onChange={handleChange} required placeholder="Confirm Password" />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Register'}
          </Button>
        </Form>
        <Row className="mt-3">
          <Col className="text-center">
            <a href="/login">Already have an account? Login</a>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default Register;
