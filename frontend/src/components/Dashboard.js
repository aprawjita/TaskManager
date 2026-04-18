import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);
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
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      }
    }
  }, [filterStatus, filterPriority, sortField, navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
   
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('priority', priority);
    
    
    if (dueDate) {
        formData.append('dueDate', dueDate);
    }
    
    
    if (files) {
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('https://taskmanager-backend-5f96.onrender.com/api/tasks', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      
      setTitle(''); 
      setDescription(''); 
      setFiles([]); 
      setDueDate('');
      
      fetchTasks();
      alert("Task created successfully!");
    } catch (error) {
      console.error("Task creation error:", error.response);
      alert("Error creating task. Please ensure you are logged in and all fields are valid.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Task Dashboard</h2>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="logout-btn">Logout</button>
      </div>
      
      <form onSubmit={handleCreateTask} className="task-form">
        <input 
            type="text" 
            placeholder="Task Title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
        />
        <textarea 
            placeholder="Task Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
        />
        <div className="form-row">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
            </select>
            <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
                required 
            />
        </div>
        <div className="file-input-wrapper">
            <label>Attach PDF Documents (Optional):</label>
            <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                onChange={(e) => setFiles(e.target.files)} 
            />
        </div>
        <button type="submit" className="submit-btn">Add Task</button>
      </form>

      <hr />

      <div className="controls">
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
        {tasks.length === 0 ? <p>No tasks found. Create one above!</p> : tasks.map(task => (
          <div key={task.id} className="task-card">
            <div className="task-card-header">
                <h3>{task.title}</h3>
                <span className={`badge ${task.priority?.toLowerCase()}`}>{task.priority}</span>
            </div>
            <p className="task-desc">{task.description}</p>
            <p className="task-date"><strong>Due:</strong> {task.dueDate || 'No date set'}</p>
            
            {task.attachedDocuments && task.attachedDocuments.length > 0 && (
              <div className="attachments">
                <strong>Attachments:</strong>
                {task.attachedDocuments.map((doc, i) => (
                  <a key={i} href={`https://taskmanager-backend-5f96.onrender.com/api/tasks/files/${doc}`} target="_blank" rel="noreferrer">
                    View PDF {i+1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;