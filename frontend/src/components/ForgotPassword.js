import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';

function ForgotPassword() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOtp = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users/auth/send-otp/', { phone });
      setOtpSent(true);
    } catch {
      setError('Failed to send OTP.');
    }
    setLoading(false);
  };

  const verifyOtpAndReset = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users/auth/verify-otp/', { phone, otp, new_password: newPassword });
      alert('Password reset successful!');
      navigate('/login');
    } catch {
      setError('OTP verification or password reset failed.');
    }
    setLoading(false);
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="p-4 shadow" style={{ maxWidth: 400, width: '100%' }}>
        <h2 className="text-center mb-3">Forgot Password</h2>
        <p className="text-center mb-4">Reset your password using OTP sent to your mobile</p>
        {error && <Alert variant="danger">{error}</Alert>}
        {!otpSent ? (
          <Form onSubmit={sendOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Mobile Number" />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Send OTP'}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={verifyOtpAndReset}>
            <Form.Group className="mb-3">
              <Form.Label>OTP</Form.Label>
              <Form.Control value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Enter OTP" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="New Password" />
            </Form.Group>
            <Button type="submit" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
            </Button>
          </Form>
        )}
      </Card>
    </Container>
  );
}

export default ForgotPassword;
