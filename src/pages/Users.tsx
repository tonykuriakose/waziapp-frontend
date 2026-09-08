import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthPermissions } from '../store/hooks';
import { UserPlus, ToggleLeft, ToggleRight } from 'lucide-react';

const Users = () => {
  const { hasPermission } = useAuthPermissions();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data || [];
    }
  });

  const toggleMutation = useMutation({
    mutationFn: async (user: any) => {
      return api.put(`/users/${user.id}`, { ...user, isActive: !user.isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const toggleUserStatus = (user: any) => {
    toggleMutation.mutate(user);
  };

  if (isLoading) return <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading users...</div>;

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>User Management</h1>
        
        {hasPermission('users.create') && (
          <button className="btn btn-primary">
            <UserPlus size={18} /> Create User
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      color: 'var(--primary)'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.75rem', 
                      fontWeight: 500,
                      backgroundColor: user.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: user.isActive ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {hasPermission('users.update') && (
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '0.25rem 0.5rem', color: user.isActive ? 'var(--danger)' : 'var(--success)' }}
                          onClick={() => toggleUserStatus(user)}
                        >
                          {user.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                          {user.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
