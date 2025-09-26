import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Navbar as BSNavbar, Nav, Container, Image } from 'react-bootstrap';

function Navbar() {
  const { logout, user } = useContext(AuthContext);
  const { inviteCount } = useContext(NotificationContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <BSNavbar.Brand as={Link} to="/groups">SplitEase</BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
              <Nav.Link as={Link} to="/groups">Groups</Nav.Link>
              <Nav.Link as={Link} to="/settlements">Settlements</Nav.Link>
              <Nav.Link as={Link} to="/history">History</Nav.Link>
          </Nav>
          <Nav className="align-items-center">
            <Nav.Link as={Link} to="/profile" className="d-flex align-items-center">
              {user && user.username ? (
                user.avatar ? (
                  <Image src={user.avatar} roundedCircle width={32} height={32} className="me-2" />
                ) : (
                  <span className="me-2" style={{ fontWeight: 'bold', fontSize: '1.2em', background: '#eee', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{user.username[0].toUpperCase()}</span>
                )
              ) : (
                <span className="me-2" style={{ fontWeight: 'bold', fontSize: '1.2em', background: '#eee', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</span>
              )}
              Profile
            </Nav.Link>
            <Nav.Link as={Link} to="/notifications" className="position-relative">
              <span role="img" aria-label="notifications" style={{ fontSize: 22, marginRight: 8 }}>🔔</span>
              Notifications
              {inviteCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: -10,
                  background: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: 12,
                  fontWeight: 700
                }}>{inviteCount}</span>
              )}
            </Nav.Link>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;