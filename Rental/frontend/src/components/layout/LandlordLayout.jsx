import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
const LandlordLayout = () => {
  return (
    <div className="landlord-layout" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar" style={{ width: '250px', background: '#34495e', color: 'white', padding: '20px' }}>
        <h2>Chủ Trọ Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '30px' }}>
          <NavLink to="/landlord" end style={{ color: 'white', textDecoration: 'none' }}>Dashboard</NavLink>
          <NavLink to="/landlord/rooms" style={{ color: 'white', textDecoration: 'none' }}>Đăng tin & Quản lý</NavLink>
          <NavLink to="/landlord/messages" style={{ color: 'white', textDecoration: 'none' }}>Tin nhắn</NavLink>
          <NavLink to="/landlord/appointments" style={{ color: 'white', textDecoration: 'none' }}>Lịch xem phòng</NavLink>
          <NavLink to="/landlord/reviews" style={{ color: 'white', textDecoration: 'none' }}>Đánh giá</NavLink>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '20px', background: '#ecf0f1' }}>
        <Outlet />
      </main>
    </div>
  );
};
export default LandlordLayout;