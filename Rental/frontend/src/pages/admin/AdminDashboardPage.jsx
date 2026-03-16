import { useEffect, useState } from "react";
import adminService from "@/services/AdminService";

const DashboardPage = () => {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  const loadData = () => {
    Promise.all([adminService.getReportedRooms(), adminService.getUsers()])
      .then(([roomsRes, usersRes]) => { setRooms(roomsRes.data); setUsers(usersRes.data); })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([adminService.getReportedRooms(), adminService.getUsers()])
      .then(([roomsRes, usersRes]) => { setRooms(roomsRes.data); setUsers(usersRes.data); })
      .catch(() => {});
  }, []);

  const deleteRoom = async (id) => {
    await adminService.deleteRoom(id);
    loadData();
  };

  const lockUser = async (id) => {
    await adminService.lockUser(id);
    loadData();
  };

  return (
    <section>
      <h1>Admin</h1>
      <h2>Tin vi phạm</h2>
      <div className="card-list">
        {rooms.map((room) => (
          <article className="card" key={room.id}>
            <p>{room.title}</p>
            <p>Báo cáo: {room.reportedCount}</p>
            <button onClick={() => deleteRoom(room.id)}>Xóa tin</button>
          </article>
        ))}
      </div>

      <h2>Tài khoản</h2>
      <div className="card-list">
        {users.map((user) => (
          <article className="card" key={user.id}>
            <p>{user.fullName}</p>
            <p>{user.email}</p>
            <p>{user.role}</p>
            <p>Trạng thái: {user.isActive ? "Hoạt động" : "Bị khóa"}</p>
            {user.role !== "admin" && user.isActive && <button onClick={() => lockUser(user.id)}>Khóa</button>}
          </article>
        ))}
      </div>
    </section>
  );
};

export default DashboardPage;
