import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/authSlice';
import { LayoutDashboard, Users, Key, LogOut } from 'lucide-react';

const Layout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { name: 'Projects', path: '/projects', icon: LayoutDashboard },
    ...(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' 
      ? [{ name: 'Users', path: '/users', icon: Users }] 
      : []),
    ...(user.role === 'SUPER_ADMIN' 
      ? [{ name: 'Permissions', path: '/permissions', icon: Key }] 
      : []),
  ];

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2 className="gradient-text" style={{ margin: 0 }}>WaziApp</h2>
          <p className="label" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
            {user.role}
          </p>
        </div>
        
        <div className="nav-menu">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
