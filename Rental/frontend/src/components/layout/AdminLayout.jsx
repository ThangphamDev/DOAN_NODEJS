import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
const AdminLayout = () => {
  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar" style={{ width: '250px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <NavLink to="/admin" end style={{ color: 'white', textDecoration: 'none' }}>Dashboard</NavLink>
          <NavLink to="/admin/rooms" style={{ color: 'white', textDecoration: 'none' }}>Quản lý phòng (Vi phạm)</NavLink>
          <NavLink to="/admin/users" style={{ color: 'white', textDecoration: 'none' }}>Quản lý tài khoản (Khóa)</NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '20px', background: '#f5f6fa' }}>
        <Outlet />
      </main>
    </div>
  );
};
export default AdminLayout;