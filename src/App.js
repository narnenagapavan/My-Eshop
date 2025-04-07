import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ManageUsers from './Components/ManageUsers';
import ManagaEmployee from './Components/ManagaEmployee';
import AddUsers from './Components/AddUsers';
import AddEmployee from './Components/AddEmployee';
import Dashboard from './Components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<ManageUsers />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="employees" element={<ManagaEmployee />} />
          <Route path="add-user" element={<AddUsers />} />
          <Route path="add-employee" element={<AddEmployee />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
