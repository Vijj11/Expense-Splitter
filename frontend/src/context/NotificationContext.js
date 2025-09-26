import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    api.get('/groups/pending-invites/')
      .then(res => setInviteCount(res.data.length))
      .catch(() => setInviteCount(0));
  }, []);

  return (
    <NotificationContext.Provider value={{ inviteCount, setInviteCount }}>
      {children}
    </NotificationContext.Provider>
  );
}
