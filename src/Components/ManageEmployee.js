import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import {
  Chip,
  Avatar,
  CircularProgress,
  Divider,
  Stack,
  Zoom,
} from '@mui/material';
import {
  WorkOutline,
  PhoneOutlined,
  AttachMoneyOutlined,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ManageEmployee.css';

const ManageEmployee = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setEditDialog(true);
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await axios.put(`http://localhost:5000/api/employees/${selectedEmployee._id}`, selectedEmployee);
      toast.success('🎉 Employee details updated successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setEditDialog(false);
      fetchEmployees();
    } catch (error) {
      toast.error('Error updating employee details', {
        theme: "colored"
      });
    } finally {
      setUpdating(false);
    }
  };

  const renderEditDialog = () => (
    <Dialog 
      open={editDialog} 
      onClose={() => setEditDialog(false)}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Zoom}
      PaperProps={{
        className: 'edit-dialog-paper'
      }}
    >
      <DialogTitle className="edit-dialog-title">
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            <WorkOutline />
          </Avatar>
          <Typography variant="h6">
            Edit Employee Details
          </Typography>
        </Stack>
      </DialogTitle>
      <DialogContent className="edit-dialog-content">
        <Box className="edit-form">
          <div className="field-group">
            <Typography className="field-label">
              <WorkOutline fontSize="small" /> Role Information
            </Typography>
            <TextField
              fullWidth
              select
              label="Job Title"
              name="jobTitle"
              value={selectedEmployee?.jobTitle || ''}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, jobTitle: e.target.value })}
              variant="outlined"
            >
              <MenuItem value="Store Manager">Store Manager</MenuItem>
              <MenuItem value="Sales Associate">Sales Associate</MenuItem>
              <MenuItem value="Inventory Manager">Inventory Manager</MenuItem>
              <MenuItem value="Cashier">Cashier</MenuItem>
              <MenuItem value="Customer Service Representative">Customer Service Representative</MenuItem>
            </TextField>
          </div>

          <div className="field-group">
            <Typography className="field-label">
              <PhoneOutlined fontSize="small" /> Contact Information
            </Typography>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={selectedEmployee?.phoneNumber || ''}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phoneNumber: e.target.value })}
              variant="outlined"
            />
          </div>

          <div className="field-group">
            <Typography className="field-label">
              <AttachMoneyOutlined fontSize="small" /> Compensation
            </Typography>
            <div className="salary-field">
              <TextField
                fullWidth
                label="Salary"
                name="salary"
                type="number"
                value={selectedEmployee?.salary || ''}
                onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: e.target.value })}
                variant="outlined"
                InputProps={{
                  className: 'salary-input'
                }}
              />
            </div>
          </div>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions className="action-buttons">
        <Button
          onClick={() => setEditDialog(false)}
          className="cancel-button"
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          className="save-button"
          variant="contained"
          disabled={updating}
          startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <div className="manage-employee">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Job Title</TableCell>
              <TableCell>Phone Number</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee._id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.jobTitle}</TableCell>
                <TableCell>{employee.phoneNumber}</TableCell>
                <TableCell>{employee.salary}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.status}
                    className={`status-chip ${employee.status.toLowerCase().replace(' ', '-')}`}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEdit(employee)}
                    variant="contained"
                    color="primary"
                  >
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {renderEditDialog()}
    </div>
  );
};

export default ManageEmployee;
