import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Box,
  Typography,
  Tooltip,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem
} from '@mui/material';
import { Edit, Delete, PersonAdd, Refresh, Search, Phone, AttachMoney } from '@mui/icons-material';
import './ManageEmployee.css';

const ManagaEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      toast.error('Error fetching employees');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axios.delete(`http://localhost:5000/api/employees/${id}`);
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } catch (error) {
        toast.error('Error deleting employee');
      }
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/employees/${selectedEmployee._id}`, selectedEmployee);
      toast.success('Employee updated successfully');
      setEditDialog(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Error updating employee');
    }
  };

  const handleChange = (e) => {
    setSelectedEmployee({
      ...selectedEmployee,
      [e.target.name]: e.target.value
    });
  };

  const filteredEmployees = employees.filter(employee =>
    `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    employee.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="manage-employees">
      <Box className="users-header">
        <Typography variant="h5" component="h2" className="page-title">
          Manage Employees
        </Typography>
        <Box className="action-buttons">
          <TextField
            placeholder="Search employees..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-field"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchEmployees} className="refresh-button">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/dashboard/add-employee')}
            className="add-button"
          >
            Add New Employee
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} className="users-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Date Joined</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee._id} className="table-row">
                <TableCell>{employee._id.slice(-6)}</TableCell>
                <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
                <TableCell>{employee.jobTitle}</TableCell>
                <TableCell>{new Date(employee.dateOfJoining).toLocaleDateString()}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>${employee.salary}</TableCell>
                <TableCell align="center" className="action-cell">
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => handleEdit(employee)}
                      className="edit-button"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(employee._id)}
                      className="delete-button"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Employee Details</DialogTitle>
        <DialogContent>
          <Box className="edit-form">
            <TextField
              fullWidth
              select
              label="Job Title"
              name="jobTitle"
              value={selectedEmployee?.jobTitle || ''}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="Store Manager">Store Manager</MenuItem>
              <MenuItem value="Sales Associate">Sales Associate</MenuItem>
              <MenuItem value="Inventory Manager">Inventory Manager</MenuItem>
              <MenuItem value="Cashier">Cashier</MenuItem>
              <MenuItem value="Customer Service Representative">Customer Service Representative</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={selectedEmployee?.phoneNumber || ''}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Salary"
              name="salary"
              type="number"
              value={selectedEmployee?.salary || ''}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AttachMoney />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManagaEmployee;
