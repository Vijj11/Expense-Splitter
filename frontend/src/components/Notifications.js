

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Container, Card, ListGroup, Button, Alert, Spinner } from 'react-bootstrap';

function Notifications() {
  const [invites, setInvites] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/groups/pending-invites/')
      .then(res => setInvites(res.data))
      .catch(() => setError('Failed to fetch invites'))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (inviteId) => {
    try {
      await api.post('/groups/accept-invite/', { invite_id: inviteId });
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch {
      setError('Failed to accept invite');
    }
  };

  const handleDecline = async (inviteId) => {
    try {
      await api.delete(`/groups/invite/${inviteId}/`);
      setInvites(invites.filter(i => i.id !== inviteId));
    } catch {
      setError('Failed to decline invite');
    }
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow mx-auto" style={{ maxWidth: 500 }}>
        <div className="d-flex align-items-center mb-3">
          <h3 className="mb-0">Notifications</h3>
          {invites.length > 0 && (
            <span style={{marginLeft: 10, background: '#dc3545', color: 'white', borderRadius: '50%', padding: '4px 10px', fontSize: 14}}>
              {invites.length}
            </span>
          )}
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <div className="text-center my-4"><Spinner animation="border" /></div>
        ) : (
          <ListGroup>
            {invites.length === 0 ? (
              <ListGroup.Item className="text-muted">No new invites.</ListGroup.Item>
            ) : (
              invites.map(invite => {
                const groupName = invite.group && invite.group.name ? invite.group.name : 'Unknown Group';
                const inviterName = invite.inviter && (invite.inviter.first_name || invite.inviter.username) ? (invite.inviter.first_name || invite.inviter.username) : 'Unknown User';
                const isBroken = !invite.group || !invite.group.name || !invite.inviter || !(invite.inviter.first_name || invite.inviter.username);
                return (
                  <ListGroup.Item key={invite.id} className="d-flex justify-content-between align-items-center">
                    <span>
                      {isBroken ? (
                        <span style={{ color: 'red', fontWeight: 'bold' }}>Invite is broken (missing group or inviter)</span>
                      ) : (
                        <>
                          Invited to group <strong>{groupName}</strong> by <strong>{inviterName}</strong>
                        </>
                      )}
                    </span>
                    <div className="d-flex gap-2">
                      <Button variant="success" size="sm" onClick={() => handleAccept(invite.id)} disabled={isBroken}>Accept</Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDecline(invite.id)} disabled={false}>Decline</Button>
                    </div>
                  </ListGroup.Item>
                );
              })
            )}
          </ListGroup>
        )}
      </Card>
    </Container>
  );
}

export default Notifications;
// import React, { useState, useEffect } from 'react';
// import api from '../services/api';
// import { Container, Card, ListGroup, Button, Alert } from 'react-bootstrap';

// function Notifications() {
//   const [invites, setInvites] = useState([]);
//   const [error, setError] = useState('');
//   const [hasNew, setHasNew] = useState(false);

//   useEffect(() => {
//     api.get('/groups/pending-invites/').then(res => {
//       setInvites(res.data);
//       setHasNew(res.data.length > 0);
//     }).catch(() => setError('Failed to fetch invites'));
//   }, []);

//   const handleAccept = async (inviteId) => {
//     try {
//       await api.post('/groups/accept-invite/', { invite_id: inviteId });
//       setInvites(invites.filter(i => i.id !== inviteId));
//     } catch {
//       setError('Failed to accept invite');
//     }
//   };

//   return (
//     <Container className="mt-4">
//       <Card className="p-4 shadow mx-auto" style={{ maxWidth: 500 }}>
//         <div className="d-flex align-items-center mb-3">
//           <h3 className="mb-0">Notifications</h3>
//           {hasNew && (
//             <span style={{marginLeft: 10, background: '#dc3545', color: 'white', borderRadius: '50%', padding: '4px 10px', fontSize: 14}}>
//               {invites.length}
//             </span>
//           )}
//         </div>
//         {error && <Alert variant="danger">{error}</Alert>}
//         <ListGroup>
//           {invites.length === 0 ? (
//             <ListGroup.Item className="text-muted">No new invites.</ListGroup.Item>
//           ) : (
//             invites.map(invite => {
//               const groupName = invite.group && invite.group.name ? invite.group.name : 'Unknown Group';
//               const inviterName = invite.inviter && (invite.inviter.first_name || invite.inviter.username) ? (invite.inviter.first_name || invite.inviter.username) : 'Unknown User';
//               const isBroken = !invite.group || !invite.group.name || !invite.inviter || !(invite.inviter.first_name || invite.inviter.username);
//               return (
//                 <ListGroup.Item key={invite.id} className="d-flex justify-content-between align-items-center">
//                   <span>
//                     {isBroken ? (
//                       <span style={{ color: 'red', fontWeight: 'bold' }}>Invite is broken (missing group or inviter)</span>
//                     ) : (
//                       <>
//                         Invited to group <strong>{groupName}</strong> by <strong>{inviterName}</strong>
//                       </>
//                     )}
//                   </span>
//                   <div className="d-flex gap-2">
//                     <Button variant="success" size="sm" onClick={() => handleAccept(invite.id)} disabled={isBroken}>Accept</Button>
//                   </div>
//                 </ListGroup.Item>
//               );
//             })
//           )}
//         </ListGroup>
//       </Card>
//     </Container>
//   );
// }

// export default Notifications;
