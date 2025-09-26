import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Row, Col } from 'react-bootstrap';

function MobileLogin() {
  const [form, setForm] = useState({ phone: '', password: '' });
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
      const res = await api.post('/users/login/', {
        identifier: form.phone,
        password: form.password
      });
      login(res.data.access);
      navigate('/groups');
    } catch {
      setError('Invalid phone or password');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="text-center mb-3">Login</h2>
        <p className="text-center mb-4">Login with your mobile number and password</p>
        {error && <div className="alert alert-danger">{error}</div>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control name="phone" value={form.phone} onChange={handleChange} required placeholder="Mobile Number" />
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
            <a href="/forgot-password">Forgot password? Login with OTP</a>
            <br></br>
            <a href="/register">Not an user? Register</a>
          </Col>
        </Row>
      </Card>
    </Container>
  );
}

export default MobileLogin;