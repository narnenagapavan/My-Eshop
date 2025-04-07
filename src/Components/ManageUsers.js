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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  InputAdornment,
  Tooltip,
  MenuItem,
  Divider,
  Stack,
  Avatar,
  CircularProgress,
  Alert,
  Grid // Add Grid to imports
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Search, 
  Refresh,
  PersonAdd,
  PersonOutline,
  StorefrontOutlined,
  PhoneOutlined,
  EmailOutlined
} from '@mui/icons-material';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editDialog, setEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [verifyPhone, setVerifyPhone] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [otpDialogs, setOtpDialogs] = useState({ phone: false, email: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser({ ...user, _original: { ...user } });
    setEditDialog(true);
    setVerifyPhone(false);
    setVerifyEmail(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        toast.success('User deleted successfully!', {
          position: "top-center",
          theme: "colored"
        });
        fetchUsers();
      } catch (error) {
        toast.error('Error deleting user', {
          position: "top-center",
          theme: "colored"
        });
      }
    }
  };

  const handleSendPhoneOTP = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-otp', {
        phoneNumber: selectedUser.phoneNumber
      });
      setOtpDialogs({ ...otpDialogs, phone: true });
      toast.success('OTP sent to phone');
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const handleSendEmailOTP = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-email-otp', {
        email: selectedUser.email
      });
      setOtpDialogs({ ...otpDialogs, email: true });
      toast.success('OTP sent to email');
    } catch (error) {
      toast.error('Failed to send email OTP');
    }
  };

  const handleVerifyPhone = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', {
        phoneNumber: selectedUser.phoneNumber,
        otp: phoneOtp
      });
      if (response.data.verified) {
        setVerifyPhone(true);
        setOtpDialogs({ ...otpDialogs, phone: false });
        toast.success('Phone number verified');
      }
    } catch (error) {
      toast.error('Invalid OTP');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-email-otp', {
        email: selectedUser.email,
        otp: emailOtp
      });
      if (response.data.verified) {
        setVerifyEmail(true);
        setOtpDialogs({ ...otpDialogs, email: false });
        toast.success('Email verified');
      }
    } catch (error) {
      toast.error('Invalid OTP');
    }
  };

  const handleUpdate = async () => {
    if (selectedUser.phoneNumber !== selectedUser._original?.phoneNumber && !verifyPhone) {
      toast.error('Please verify the new phone number');
      return;
    }
    if (selectedUser.email !== selectedUser._original?.email && !verifyEmail) {
      toast.error('Please verify the new email');
      return;
    }
    try {
      setEditing(true);
      await axios.put(`http://localhost:5000/api/users/${selectedUser._id}`, selectedUser);
      toast.success('User updated successfully');
      setEditDialog(false);
      fetchUsers();
    } catch (error) {
      toast.error('Error updating user');
    } finally {
      setEditing(false);
    }
  };

  const handleChange = (e) => {
    setSelectedUser({
      ...selectedUser,
      [e.target.name]: e.target.value
    });
  };

  const filteredUsers = users.filter(user => 
    user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.shopName?.toLowerCase().includes(search.toLowerCase())
  );

  const renderEditDialog = () => (
    <Dialog 
      open={editDialog} 
      onClose={() => setEditDialog(false)}
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <StorefrontOutlined />
          </Avatar>
          <Typography variant="h6">Edit Shop Details</Typography>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {/* Owner Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Owner Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={selectedUser?.firstName || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={selectedUser?.lastName || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          {/* Shop Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Shop Details
            </Typography>
            <TextField
              fullWidth
              label="Shop Name"
              name="shopName"
              value={selectedUser?.shopName || ''}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <StorefrontOutlined />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Contact Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={selectedUser?.phoneNumber || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
                {selectedUser?.phoneNumber !== selectedUser?._original?.phoneNumber && (
                  <Button
                    variant="contained"
                    onClick={handleSendPhoneOTP}
                    disabled={verifyPhone}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {verifyPhone ? 'Verified ✓' : 'Verify'}
                  </Button>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={selectedUser?.email || ''}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
                {selectedUser?.email !== selectedUser?._original?.email && (
                  <Button
                    variant="contained"
                    onClick={handleSendEmailOTP}
                    disabled={verifyEmail}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {verifyEmail ? 'Verified ✓' : 'Verify'}
                  </Button>
                )}
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button onClick={() => setEditDialog(false)} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={editing}
          startIcon={editing ? <CircularProgress size={20} /> : null}
        >
          Save Changes
        </Button>
      </DialogActions>

      {/* Phone OTP Dialog */}
      <Dialog open={otpDialogs.phone} onClose={() => setOtpDialogs({ ...otpDialogs, phone: false })}>
        <DialogTitle>Verify Phone Number</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter OTP"
            value={phoneOtp}
            onChange={(e) => setPhoneOtp(e.target.value)}
            margin="dense"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialogs({ ...otpDialogs, phone: false })}>Cancel</Button>
          <Button onClick={handleVerifyPhone} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>

      {/* Email OTP Dialog */}
      <Dialog open={otpDialogs.email} onClose={() => setOtpDialogs({ ...otpDialogs, email: false })}>
        <DialogTitle>Verify Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter OTP"
            value={emailOtp}
            onChange={(e) => setEmailOtp(e.target.value)}
            margin="dense"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialogs({ ...otpDialogs, email: false })}>Cancel</Button>
          <Button onClick={handleVerifyEmail} variant="contained">Verify</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );

  return (
    <div className="manage-users">
      <Box className="users-header">
        <Typography variant="h5" component="h2" className="page-title">
          Manage Shop Users
        </Typography>
        <Box className="action-buttons">
          <TextField
            placeholder="Search users..."
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
            <IconButton onClick={fetchUsers} className="refresh-button">
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/dashboard/add-user')}
            className="add-button"
          >
            Add New Shop
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper} className="users-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Shop ID</TableCell>
              <TableCell>Owner Name</TableCell>
              <TableCell>Shop Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Garment Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id} className="table-row">
                <TableCell>{user._id.slice(-6)}</TableCell>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.shopName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.garmentType}</TableCell>
                <TableCell align="center" className="action-cell">
                  <Tooltip title="Edit">
                    <IconButton 
                      onClick={() => handleEdit(user)}
                      className="edit-button"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      onClick={() => handleDelete(user._id)}
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

      {renderEditDialog()}
    </div>
  );
};

export default ManageUsers;
