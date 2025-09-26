import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { Container, Card, ListGroup, Button, Image, Row, Col } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function Profile() {
  const [profile, setProfile] = useState({ username: '', email: '', phone: '', avatar: '', groups: [] });
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/users/profile/').then(res => setProfile(res.data));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container className="mt-4">
      <Card className="mx-auto p-4 shadow" style={{ maxWidth: 500 }}>
        <Row className="align-items-center mb-3">
          <Col xs="auto">
            {profile.avatar ? (
              <Image src={profile.avatar} roundedCircle width={64} height={64} />
            ) : (
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold' }}>
                {profile.first_name ? profile.first_name[0].toUpperCase() : (profile.username ? profile.username[0].toUpperCase() : '?')}
              </div>
            )}
          </Col>
          <Col>
            <h4 className="mb-0">
              {profile.first_name ? `${profile.first_name} ` : ''}
              {profile.last_name ? `${profile.last_name} ` : ''}
              <span className="text-secondary" style={{ fontWeight: 400, fontSize: '0.9em' }}>({profile.username})</span>
            </h4>
            <div className="text-muted">{profile.phone}</div>
          </Col>
        </Row>
        <hr />
        <Card.Subtitle className="mb-2 text-muted">Groups Joined</Card.Subtitle>
        <ListGroup className="mb-3">
          {profile.groups && profile.groups.length > 0 ? (
            profile.groups.map(g => (
              <ListGroup.Item key={g.id}>
                <Link to={`/groups/${g.id}`} style={{ textDecoration: 'none' }}>{g.name}</Link>
              </ListGroup.Item>
            ))
          ) : (
            <ListGroup.Item className="text-muted">No groups joined yet.</ListGroup.Item>
          )}
        </ListGroup>
        <div className="d-flex justify-content-end">
          <Button variant="danger" onClick={handleLogout}>Logout</Button>
        </div>
      </Card>
    </Container>
  );
}

export default Profile;