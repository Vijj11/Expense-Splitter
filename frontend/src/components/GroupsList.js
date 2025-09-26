import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Card, Button, Container, Row, Col, Badge, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function GroupsList() {
  const [sortBy, setSortBy] = useState("recent");
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get('/groups/').then(res => setGroups(res.data));
  }, []);

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await api.delete(`/groups/${groupId}/`);
        setGroups(groups.filter(g => g.id !== groupId));
      } catch {
        alert('Failed to delete group');
      }
    }
  };

  return (
    <Container>
      <Row className="align-items-center mb-4">
        <Col><h2 className="fw-bold">Your Groups</h2></Col>
        <Col className="text-end">
          <Button as={Link} to="/groups/create" variant="success">+ Create Group</Button>
        </Col>
      </Row>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          style={{maxWidth: 300, display: 'inline-block', marginRight: 16}}
          placeholder="Search groups..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="form-select" style={{maxWidth:220, display: 'inline-block'}} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="recent">Sort by Most Recent Activity</option>
          <option value="amount">Sort by Highest Amount Spent</option>
        </select>
      </div>
      <Row>
        {groups.length === 0 ? (
          <Col className="text-center text-muted">No groups yet. Create your first group!</Col>
        ) : (
          [...groups]
            .filter(group => group.name.toLowerCase().includes(search.toLowerCase()))
            .sort((a, b) => {
              if (sortBy === "recent") {
                return new Date(b.last_activity || b.created_at) - new Date(a.last_activity || a.created_at);
              }
              if (sortBy === "amount") {
                return (b.total_amount || 0) - (a.total_amount || 0);
              }
              return 0;
            })
            .map(group => (
              <Col md={6} lg={4} key={group.id} className="mb-4">
                <Card className="shadow h-100 border-0 rounded-4">
                  <Card.Body className="d-flex flex-column justify-content-between">
                    <div>
                      <Card.Title className="mb-2 fs-4 fw-bold text-primary">{group.name}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">Created by: <span className="fw-semibold">{group.created_by?.first_name || group.created_by?.username || 'Unknown'}</span></Card.Subtitle>
                      <Card.Text>
                        <span className="d-block mb-2"><strong>Description:</strong> {group.description || 'No description'}</span>
                        <strong>Members:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {group.members && group.members.length > 0 ? (
                            group.members.map(m => (
                              <Badge key={m.id} bg="info" className="d-flex align-items-center p-2 rounded-pill">
                                {m.avatar ? (
                                  <Image src={m.avatar} roundedCircle width={24} height={24} className="me-2" />
                                ) : (
                                  <span className="me-2" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>{(m.first_name ? m.first_name[0] : m.username[0]).toUpperCase()}</span>
                                )}
                                {m.first_name || m.username}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted">No members yet.</span>
                          )}
                        </div>
                        {sortBy === "amount" && (
                          <div className="mt-2"><strong>Total Amount Spent:</strong> ₹{group.total_amount || 0}</div>
                        )}
                        {sortBy === "recent" && (
                          <div className="mt-2"><strong>Last Activity:</strong> {group.last_activity ? new Date(group.last_activity).toLocaleString() : new Date(group.created_at).toLocaleString()}</div>
                        )}
                      </Card.Text>
                    </div>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <Button as={Link} to={`/expenses?group=${group.id}`} variant="primary">View Expenses</Button>
                      <Button as={Link} to={`/groups/${group.id}`} variant="outline-secondary">Group Details</Button>
                      <Button as={Link} to={`/groups/${group.id}/invite`} variant="success">Invite Members</Button>
                      <Button variant="danger" onClick={() => handleDelete(group.id)}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
        )}
      </Row>
    </Container>
  );
}

export default GroupsList;