import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';

function Login() {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/users/login/', form);
      login(res.data.access);
      navigate('/groups');
    } catch (err) {
      if (err.response?.data?.error === 'Invalid credentials') {
        setError('Invalid credentials.');
      } else if (err.response?.data?.error === 'User not registered') {
        navigate('/register');
      } else {
        setError('Login failed.');
      }
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="text-center mb-3">Welcome Back</h2>
        <p className="text-center mb-4">Login to SplitEase and manage your groups and expenses!</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Username or Phone</Form.Label>
            <Form.Control name="identifier" value={form.identifier} onChange={handleChange} required placeholder="Username or Mobile Number" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Password" />
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
          </Button>
        </Form>
        <Row className="mt-3">
          <Col className="text-center">
            <a href="/forgot-password">Forgot password?</a>
          </Col>
          <Col className="text-center">
            <a href="/register">No account? Register</a>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default Login;