import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthPermissions } from '../store/hooks';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';

const Projects = () => {
  const { hasPermission } = useAuthPermissions();
  const queryClient = useQueryClient();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', address: '', useCase: '', status: 'ACTIVE' });

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newProject: any) => {
      return api.post('/projects', newProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setFormData({ name: '', address: '', useCase: '', status: 'ACTIVE' });
      toast.success('Project created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create project');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedProject: any) => {
      return api.put(`/projects/${editingProjectId}`, updatedProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsEditModalOpen(false);
      setEditingProjectId(null);
      setFormData({ name: '', address: '', useCase: '', status: 'ACTIVE' });
      toast.success('Project updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update project');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsDeleteModalOpen(false);
      setDeletingProjectId(null);
      toast.success('Project deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const openEditModal = (project: any) => {
    setEditingProjectId(project.id);
    setFormData({
      name: project.name,
      address: project.address,
      useCase: project.useCase,
      status: project.status
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (id: string) => {
    setDeletingProjectId(id);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) return <Loading message="Loading projects..." />;
  if (isError) return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Failed to load projects.</div>;

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2rem', margin: 0 }}>Projects</h1>
          
          {hasPermission('projects.create') && (
            <button className="btn btn-primary" onClick={() => {
              setFormData({ name: '', address: '', useCase: '', status: 'ACTIVE' });
              setIsModalOpen(true);
            }}>
              <Plus size={18} /> Create Project
            </button>
          )}
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'transparent' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Address</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((project: any) => (
                  <tr key={project.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem' }}>{project.name}</td>
                    <td style={{ padding: '1rem' }}>{project.address}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '9999px', 
                        fontSize: '0.75rem', 
                        fontWeight: 500,
                        backgroundColor: project.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: project.status === 'ACTIVE' ? 'var(--success)' : 'var(--warning)'
                      }}>
                        {project.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {hasPermission('projects.update') && (
                          <button onClick={() => openEditModal(project)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
                            <Edit size={16} /> Edit
                          </button>
                        )}
                        {hasPermission('projects.delete') && (
                          <button onClick={() => openDeleteModal(project.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                            <Trash2 size={16} /> Delete
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

      {/* Create Modal */}
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
            
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Create Project</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Project Name</label>
                <input type="text" className="input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Address</label>
                <input type="text" className="input" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="label">Use Case</label>
                <textarea className="input" style={{ minHeight: '100px', resize: 'vertical' }} required value={formData.useCase} onChange={(e) => setFormData({...formData, useCase: e.target.value})} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', zIndex: 9999, padding: '2rem', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', position: 'relative', margin: 'auto', background: 'var(--surface)', borderRadius: '24px' }}>
            <button 
              onClick={() => setIsEditModalOpen(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--text)' }}>Edit Project</h2>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Project Name</label>
                <input type="text" className="input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="label">Address</label>
                <input type="text" className="input" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>
              <div>
                <label className="label">Use Case</label>
                <textarea className="input" style={{ minHeight: '100px', resize: 'vertical' }} required value={formData.useCase} onChange={(e) => setFormData({...formData, useCase: e.target.value})} />
              </div>
              <div>
                <label className="label">Status</label>
                <select className="input" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
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
            <h2 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Delete Project?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Are you sure you want to delete this project? This action cannot be undone.</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={() => deleteMutation.mutate(deletingProjectId!)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
