import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [sortField, setSortField] = useState('id');
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      params.append('sortBy', sortField);

      const token = localStorage.getItem('token'); 
      const response = await axios.get(`https://taskmanager-backend-5f96.onrender.com/api/tasks?${params.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) navigate('/login');
    }
  }, [filterStatus, filterPriority, sortField, navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // EMERGENCY FIX: Sending standard JSON instead of multipart/form-data
    const taskData = {
      title: title,
      description: description,
      priority: priority,
      dueDate: dueDate
    };

    try {
      await axios.post('https://taskmanager-backend-5f96.onrender.com/api/tasks', taskData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      setTitle(''); setDescription(''); setDueDate('');
      fetchTasks();
    } catch (error) {
      console.error("Task creation failed", error.response);
      alert("Error creating task. Check console for details.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Task Dashboard</h2>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">Logout</button>
      </div>
      
      <form onSubmit={handleCreateTask} className="task-form">
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button type="submit">Add Task</button>
      </form>

      <div className="controls" style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
        <select onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="DONE">Done</option>
        </select>
        <select onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select onChange={(e) => setSortField(e.target.value)}>
          <option value="id">Sort by Default</option>
          <option value="priority">Sort by Priority</option>
          <option value="dueDate">Sort by Due Date</option>
        </select>
      </div>

      <div className="task-list">
        {tasks.map(task => (
          <div key={task.id} className="task-card">
            <h3>{task.title} <span className={`badge ${task.priority?.toLowerCase()}`}>{task.priority}</span></h3>
            <p>{task.description}</p>
            <p>Due: {task.dueDate || 'No date'}</p>
            {task.attachedDocuments?.map((doc, i) => (
              <a key={i} href={`https://taskmanager-backend-5f96.onrender.com/api/tasks/files/${doc}`} target="_blank" rel="noreferrer">PDF {i+1} </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;