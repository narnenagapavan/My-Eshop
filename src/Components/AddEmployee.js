import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Box, TextField, Button, MenuItem, Paper, Typography,
  InputAdornment, IconButton, Checkbox, FormControlLabel, Container, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Visibility, VisibilityOff, Person, Phone,
  Lock, AttachMoney, CalendarMonth, Work
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import './AddEmployee.css';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: null,
    gender: '',
    jobTitle: '',
    dateOfJoining: null,
    salary: '',
    phoneNumber: '',
    alternatePhone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const jobTitles = [
    'Store Manager', 'Sales Associate', 'Inventory Manager', 'Cashier', 'Customer Service Representative'
  ];

  const handleChange = (e) => {
    if (['phoneNumber', 'alternatePhone'].includes(e.target.name)) {
      const value = e.target.value.replace(/[^\d+]/, '');
      if (value === '' || /^\+?\d*$/.test(value)) {
        setFormData({ 
          ...formData, 
          [e.target.name]: value 
        });
      }
    } else {
      setFormData({ 
        ...formData, 
        [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/employees', formData);
      toast.success('Employee created successfully!');
    } catch (error) {
      toast.error('Error creating employee');
    }
  };

  const handleVerifyPhone = async () => {
    try {
      await axios.post('http://localhost:5000/api/send-otp', {
        phoneNumber: formData.phoneNumber
      });
      setOtpDialog(true);
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error('Error sending OTP');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', {
        phoneNumber: formData.phoneNumber,
        otp
      });
      if (response.data.verified) {
        setIsPhoneVerified(true);
        setOtpDialog(false);
        toast.success('Phone number verified successfully!');
      }
    } catch (error) {
      toast.error('Invalid OTP');
    }
  };

  const renderOTPDialog = () => (
    <Dialog open={otpDialog} onClose={() => setOtpDialog(false)}>
      <DialogTitle>Verify Phone Number</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="dense"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOtpDialog(false)}>Cancel</Button>
        <Button onClick={handleVerifyOTP} variant="contained" color="primary">
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md">
      <Paper elevation={3} className="add-employee-form">
        <Typography variant="h5" className="form-title">Add Employee</Typography>
        <Box component="form" onSubmit={handleSubmit} className="form-content">
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Person /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box className="phone-verify-container">
                <TextField
                  className="form-field"
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  inputProps={{
                    type: 'tel',
                    pattern: '[+]?[0-9]*',
                    inputMode: 'numeric'
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  variant="contained"
                  className="verify-button"
                  onClick={handleVerifyPhone}
                  disabled={isPhoneVerified}
                >
                  {isPhoneVerified ? 'Verified' : 'Verify'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(date) => setFormData({ ...formData, dateOfBirth: date })}
                  renderInput={(params) => <TextField {...params} required />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Gender"
                name="gender"
                select
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Alternate Phone"
                name="alternatePhone"
                value={formData.alternatePhone}
                onChange={handleChange}
                inputProps={{
                  type: 'tel',
                  pattern: '[+]?[0-9]*',
                  inputMode: 'numeric'
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><Phone /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Job Title"
                name="jobTitle"
                select
                value={formData.jobTitle}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Work /></InputAdornment> }}
              >
                {jobTitles.map((title) => (
                  <MenuItem key={title} value={title}>{title}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Joining"
                  value={formData.dateOfJoining}
                  onChange={(date) => setFormData({ ...formData, dateOfJoining: date })}
                  renderInput={(params) => <TextField {...params} required />}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Salary"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><AttachMoney /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><Lock /></InputAdornment> }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    required
                  />
                }
                label="I accept the Terms and Conditions"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="submit-button"
              >
                Create Employee Account
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {renderOTPDialog()}
    </Container>
  );
};

export default AddEmployee;
