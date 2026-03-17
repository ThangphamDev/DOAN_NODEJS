import { useEffect, useState } from "react";
import adminService from "@/services/AdminService";
import { getApiData, getApiMessage } from "@/utils/apiResponse";

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUsers = async () => {
    try {
      const response = await adminService.getUsers();
      setUsers(getApiData(response, []));
      setError("");
    } catch (err) {
      setError(getApiMessage(err, "Không tải được danh sách tài khoản"));
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initUsers = async () => {
      try {
        const response = await adminService.getUsers();
        if (!isMounted) return;
        setUsers(getApiData(response, []));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getApiMessage(err, "Không tải được danh sách tài khoản"));
        setSuccessMessage("");
      }
    };

    initUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const lockUser = async (userId) => {
    try {
      await adminService.lockUser(userId);
      setSuccessMessage("Đã khóa tài khoản.");
      setError("");
      await loadUsers();
    } catch (err) {
      setError(getApiMessage(err, "Không thể khóa tài khoản"));
      setSuccessMessage("");
    }
  };

  return (
    <section>
      <h1>Khóa tài khoản người dùng</h1>
      {error && <p className="auth-error">{error}</p>}
      {successMessage && <p className="customer-success">{successMessage}</p>}

      {users.length === 0 ? (
        <p className="customer-note">Chưa có tài khoản để quản lý.</p>
      ) : (
        <div className="customer-review-items">
          {users.map((user) => (
            <article key={user.id} className="customer-review-item">
              <div className="customer-review-top">
                <strong>{user.fullName || "Người dùng"}</strong>
                <span>{user.role}</span>
              </div>
              <p>{user.email}</p>
              <p>Trạng thái: {user.isActive ? "Đang hoạt động" : "Đã khóa"}</p>
              {user.role !== "admin" && user.isActive && (
                <button
                  type="button"
                  className="auth-button"
                  style={{ background: "#c0392b", marginTop: 10 }}
                  onClick={() => lockUser(user.id)}
                >
                  Khóa tài khoản
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageUsersPage;
