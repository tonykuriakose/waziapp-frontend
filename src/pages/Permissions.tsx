import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../api/axios';
import { Save } from 'lucide-react';

const availablePermissions = [
  'projects.read', 'projects.create', 'projects.update', 'projects.delete',
  'users.read', 'users.create', 'users.update', 'users.disable',
  'permissions.manage'
];

const Permissions = () => {
  const [adminPermissions, setAdminPermissions] = useState<string[]>([
    'projects.read', 'projects.create', 'projects.update', 'projects.delete',
    'users.read', 'users.create', 'users.update', 'users.disable'
  ]);
  const [success, setSuccess] = useState(false);

  const togglePermission = (perm: string) => {
    if (adminPermissions.includes(perm)) {
      setAdminPermissions(adminPermissions.filter(p => p !== perm));
    } else {
      setAdminPermissions([...adminPermissions, perm]);
    }
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.put('/users/permissions/roles/ADMIN', { permissions: adminPermissions });
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleSave = () => {
    setSuccess(false);
    saveMutation.mutate();
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Permission Management</h1>
          <p className="label" style={{ marginTop: '0.5rem' }}>Configure default permissions for the ADMIN role.</p>
        </div>
        
        <button className="btn btn-primary" onClick={handleSave} disabled={saveMutation.isPending}>
          <Save size={18} /> {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {success && (
        <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          Permissions successfully updated for all Admins!
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 600 }}>ADMIN Role Permissions</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {availablePermissions.map(perm => (
            <label key={perm} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={adminPermissions.includes(perm)}
                onChange={() => togglePermission(perm)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
              />
              <span style={{ color: 'var(--text-muted)' }}>{perm}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Permissions;
