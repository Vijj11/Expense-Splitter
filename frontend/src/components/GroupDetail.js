import React, { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    api.get(`/groups/${id}/`).then(res => setGroup(res.data));
  }, [id]);

  const isAdmin = user && group && group.created_by && (user.id === group.created_by.id);

  if (!group) return <Container className="text-center mt-5">Loading...</Container>;

  // Debug log for admin check
  console.log('isAdmin:', isAdmin, 'user:', user, 'created_by:', group && group.created_by);
  const handleLeaveGroup = async () => {
    try {
      await api.post(`/groups/${group.id}/leave/`);
      navigate('/groups');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave group.');
    }
  };

  // Remove member handler (admin only)
  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Remove this member from the group?')) {
      try {
        await api.post(`/groups/${group.id}/remove-member/`, { member_id: memberId });
        setGroup(prev => ({ ...prev, members: prev.members.filter(m => m.id !== memberId) }));
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to remove member.');
      }
    }
  };

  // Delete group handler (admin only)
  const handleDeleteGroup = async () => {
    if (window.confirm('Delete this group for all members?')) {
      try {
        await api.post(`/groups/${group.id}/delete/`);
        navigate('/groups');
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to delete group.');
      }
    }
  };

  // ...existing code...

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-lg mx-auto" style={{ maxWidth: 600, borderRadius: 18 }}>
        <div className="mb-4">
          <h2 className="mb-2" style={{ fontWeight: 700 }}>{group.name}</h2>
          <p className="mb-1"><strong>Description:</strong> <span className="text-secondary">{group.description || 'No description'}</span></p>
            <p className="mb-1"><strong>Created by:</strong> <span className="text-primary">{group.created_by?.first_name || group.created_by?.username || 'Unknown'}</span></p>
          <p className="mb-1"><strong>Created at:</strong> <span className="text-secondary">{new Date(group.created_at).toLocaleString()}</span></p>
        </div>
        <hr />
        <h5 className="mb-3">Members</h5>
        <div className="mb-4">
          {group.members && group.members.length > 0 ? (
            group.members.map(m => (
              <div key={m.id} style={{ fontSize: '1em', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{m.first_name || m.username}</span>
                {isAdmin && m.id !== user.id && (
                  <Button variant="outline-danger" size="sm" onClick={() => handleRemoveMember(m.id)}>
                    Remove
                  </Button>
                )}
              </div>
            ))
          ) : (
            <span className="text-muted" style={{ fontStyle: 'italic' }}>No members yet.</span>
          )}
        </div>
        <div className="d-flex flex-column gap-3">
          <Button variant="primary" size="lg" style={{ borderRadius: 12 }} onClick={() => navigate(`/expenses?group=${group.id}`)}>
            View Expenses
          </Button>
          <Button variant="success" size="lg" style={{ borderRadius: 12 }} onClick={() => navigate(`/groups/${group.id}/invite`)}>
            Invite Members
          </Button>
          <Button variant="warning" size="lg" style={{ borderRadius: 12 }} onClick={() => navigate(`/groups/${group.id}/split`)}>
            View Final Split
          </Button>
          {isAdmin ? (
            <>
              <Button variant="outline-danger" size="lg" style={{ borderRadius: 12 }} onClick={handleDeleteGroup}>
                Delete Group
              </Button>
              <Button variant="outline-secondary" size="lg" style={{ borderRadius: 12 }} onClick={handleLeaveGroup}>
                Leave Group
              </Button>
            </>
          ) : (
            <Button variant="outline-secondary" size="lg" style={{ borderRadius: 12 }} onClick={handleLeaveGroup}>
              Leave Group
            </Button>
          )}
        </div>
      </Card>
    </Container>
  );
}

export default GroupDetail;
