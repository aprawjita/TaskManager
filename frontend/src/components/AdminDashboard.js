import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users', getAuthHeaders());
      setUsers(response.data);
    } catch (error) {
      if (error.response && (error.response.status === 403 || error.response.status === 401)) {
        navigate('/dashboard'); 
      }
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/admin/users/${id}`, getAuthHeaders());
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Admin User Management</h2>
        <button onClick={() => navigate('/dashboard')} className="logout-btn" style={{ backgroundColor: '#bb86fc' }}>Back to Tasks</button>
      </div>

      <div className="task-list">
        {users.map(user => (
          <div key={user.id} className="task-card">
            <h3>{user.email || user.username}</h3>
            <p className="task-status">Role: {user.role}</p>
            <button onClick={() => handleDeleteUser(user.id)} className="delete-btn" style={{ marginTop: '10px' }}>Delete User</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;