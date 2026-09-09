import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthPermissions } from '../store/hooks';
import { UserPlus, ToggleLeft, ToggleRight, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const Users = () => {
  const { hasPermission, user: currentUser } = useAuthPermissions();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ email: '', password: '', role: 'AGENT' });
  const [showPassword, setShowPassword] = useState(false);

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
    onSuccess: (data: any, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`User ${variables.isActive ? 'disabled' : 'enabled'} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user status');
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newUser: any) => {
      return api.post('/users', newUser);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setFormData({ email: '', password: '', role: 'AGENT' });
      toast.success('User created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
      toast.success('User deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const toggleUserStatus = (user: any) => {
    toggleMutation.mutate(user);
  };

  const openDeleteModal = (id: string) => {
    setDeletingUserId(id);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <Loading message="Loading users..." />;

  return (
    <>
      <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>User Management</h1>
        
        {hasPermission('users.create') && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <UserPlus size={18} /> Create User
          </button>
        )}
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'transparent' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
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
                  <td style={{ padding: '1rem' }}>
                    {user.email}
                    {currentUser?.id === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(You)</span>}
                  </td>
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
                      {hasPermission('users.update') && currentUser?.id !== user.id && (
                        <>
                          {/* Super Admins can toggle anyone (except themselves, handled above). Admins can only toggle AGENTs */}
                          {(currentUser?.role === 'SUPER_ADMIN' || user.role === 'AGENT') && (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', color: user.isActive ? 'var(--danger)' : 'var(--success)' }}
                              onClick={() => toggleUserStatus(user)}
                            >
                              {user.isActive ? <ToggleLeft size={16} /> : <ToggleRight size={16} />}
                              {user.isActive ? 'Disable' : 'Enable'}
                            </button>
                          )}
                          
                          {currentUser?.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && (
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => openDeleteModal(user.id)}
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          )}
                        </>
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

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', zIndex: 9999, padding: '2rem', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', margin: 'auto', background: 'var(--surface)', borderRadius: '24px' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Create User</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Email Address</label>
                <input type="email" className="input" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="input" 
                    required 
                    value={formData.password} 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ 
                      position: 'absolute', 
                      right: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', zIndex: 9999, padding: '2rem', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', position: 'relative', margin: 'auto', textAlign: 'center', background: 'var(--surface)', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Delete User?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you sure you want to delete this user? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => deleteMutation.mutate(deletingUserId!)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;
