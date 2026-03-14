import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import roomService from "@/services/RoomService";

const HomePage = () => {
  const [rooms, setRooms] = useState([]);
  const [filters, setFilters] = useState({ minPrice: "", maxPrice: "", area: "" });

  const fetchRooms = async () => {
    const { data } = await roomService.listRooms(filters);
    setRooms(data.data || []);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const onChange = (e) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <section>
      <h1>Tìm phòng</h1>
      <div className="grid-3">
        <input name="minPrice" placeholder="Giá từ" value={filters.minPrice} onChange={onChange} />
        <input name="maxPrice" placeholder="Đến" value={filters.maxPrice} onChange={onChange} />
        <input name="area" placeholder="Khu vực" value={filters.area} onChange={onChange} />
      </div>
      <button onClick={fetchRooms}>Lọc</button>

      <div className="card-list">
        {rooms.map((room) => (
          <article key={room.id} className="card">
            <h3>{room.title}</h3>
            <p>{room.address}</p>
            <p>{Number(room.price).toLocaleString()} VND</p>
            <Link to={`/rooms/${room.id}`}>Xem chi tiết</Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HomePage;
