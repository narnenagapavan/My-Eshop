import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Paper,
  Typography,
  Container,
  FormControlLabel,
  Checkbox,
  IconButton,
  InputAdornment,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Backdrop,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Zoom,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Store,
  Phone,
  Email,
  Lock,
  LocationOn,
  Checkroom,
  CheckCircle,
} from '@mui/icons-material';
import './AddUsers.css';

const AddUsers = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    shopName: '',
    shopAddress: '',
    garmentType: '',
    phoneNumber: '+91',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [otpDialog, setOtpDialog] = useState(false);
  const [otp, setOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailDialog, setEmailDialog] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
    title: ''
  });

  const steps = ['Personal Info', 'Shop Details', 'Verification', 'Security'];

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match', {
        position: "top-center",
        theme: "colored"
      });
      return;
    }
    if (!formData.termsAccepted) {
      toast.error('Please accept the terms and conditions', {
        position: "top-center",
        theme: "colored"
      });
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      toast.success('🎉 Shop registered successfully!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setTimeout(() => {
        navigate('/dashboard/users');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error registering shop', {
        theme: "colored"
      });
    }
  };

  const handleChange = (e) => {
    if (e.target.name === 'phoneNumber') {
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

  const handleVerifyPhone = async () => {
    if (!formData.phoneNumber) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid phone number',
        severity: 'error',
        title: 'Error'
      });
      return;
    }
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/send-otp', {
        phoneNumber: formData.phoneNumber
      });
      setOtpDialog(true);
      setSnackbar({
        open: true,
        message: `OTP sent successfully to ${formData.phoneNumber}`,
        severity: 'success',
        title: 'Success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to send OTP. Please try again.',
        severity: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-otp', {
        phoneNumber: formData.phoneNumber,
        otp: otp
      });
      
      if (response.data.verified) {
        setIsPhoneVerified(true);
        setOtpDialog(false);
        setFormData({ ...formData, phoneVerified: true });
        toast.success('Phone Number Verified', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "colored"
        });
      }
    } catch (error) {
      toast.error('OTP is wrong', {
        position: "top-center",
        theme: "colored"
      });
    }
  };

  const handleVerifyEmail = async () => {
    if (!formData.email) {
      setSnackbar({
        open: true,
        message: 'Please enter a valid email address',
        severity: 'error',
        title: 'Error'
      });
      return;
    }
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/send-email-otp', {
        email: formData.email
      });
      setEmailDialog(true);
      setSnackbar({
        open: true,
        title: 'Success',
        message: `OTP has been sent to ${formData.email}`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        title: 'Error',
        message: 'Failed to send OTP. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/verify-email-otp', {
        email: formData.email,
        otp: emailOtp
      });
      if (response.data.verified) {
        setIsEmailVerified(true);
        setEmailDialog(false);
        setSnackbar({
          open: true,
          title: 'Verified',
          message: 'Email verified successfully!',
          severity: 'success'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        title: 'Error',
        message: 'Invalid OTP. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderOTPDialog = () => (
    <Dialog open={otpDialog} onClose={() => setOtpDialog(false)}>
      <DialogTitle>Verify Phone Number</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          An OTP has been sent to your phone number
        </Typography>
        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          margin="dense"
          type="number"
          placeholder="Enter 6 digit OTP"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOtpDialog(false)}>Cancel</Button>
        <Button 
          onClick={handleVerifyOTP} 
          variant="contained" 
          color="primary"
          disabled={!otp || otp.length !== 6}
        >
          Verify OTP
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderEmailOTPDialog = () => (
    <Dialog open={emailDialog} onClose={() => setEmailDialog(false)}>
      <DialogTitle sx={{ textAlign: 'center', color: 'primary.main' }}>
        <Email sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h6">Verify Email</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mb: 2 }}>
          Please enter the verification code sent to {formData.email}
        </Typography>
        <TextField
          fullWidth
          label="Enter OTP"
          value={emailOtp}
          onChange={(e) => setEmailOtp(e.target.value)}
          margin="dense"
          type="number"
          placeholder="Enter 6 digit OTP"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, justifyContent: 'center' }}>
        <Button 
          onClick={handleVerifyEmailOTP} 
          variant="contained"
          disabled={!emailOtp || emailOtp.length !== 6 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{ minWidth: 150 }}
        >
          Verify OTP
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderSnackbar = () => (
    <Snackbar 
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        onClose={handleCloseSnackbar} 
        severity={snackbar.severity}
        variant="filled"
        elevation={6}
        sx={{ width: '100%' }}
      >
        <AlertTitle>{snackbar.title}</AlertTitle>
        {snackbar.message}
      </Alert>
    </Snackbar>
  );

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} className="add-user-form">
        <Typography variant="h5" gutterBottom fontWeight="bold" align="center">
          Register Your Shop
        </Typography>
        <Typography variant="body2" gutterBottom align="center" color="textSecondary" sx={{ mb: 3 }}>
          Complete the form below to create your shop account
        </Typography>

        <Box component="form" onSubmit={handleSubmit} className="form-content">
          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Shop Information */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Store />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shop Address"
                name="shopAddress"
                value={formData.shopAddress}
                onChange={handleChange}
                required
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOn />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Garment Type"
                name="garmentType"
                value={formData.garmentType}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Checkroom />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="Men">Men</MenuItem>
                <MenuItem value="Women">Women</MenuItem>
                <MenuItem value="Both">Both</MenuItem>
              </TextField>
            </Grid>

            {/* Contact & Security */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  disabled={isPhoneVerified}
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
                  onClick={handleVerifyPhone}
                  sx={{ minWidth: '120px' }}
                  disabled={isPhoneVerified}
                >
                  {isPhoneVerified ? 'Verified ✓' : 'Verify'}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isEmailVerified}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button 
                  variant="contained"
                  onClick={handleVerifyEmail}
                  disabled={isEmailVerified || loading}
                  sx={{ minWidth: '120px' }}
                >
                  {isEmailVerified ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle />
                      <span>Verified</span>
                    </Box>
                  ) : loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
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
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                }}
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
                    color="primary"
                  />
                }
                label="I agree to the Terms of Service and Privacy Policy"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                className="submit-button"
              >
                Create Shop Account
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
      {renderOTPDialog()}
      {renderEmailOTPDialog()}
      {renderSnackbar()}
      <Backdrop open={loading} sx={{ zIndex: 9999 }}>
        <CircularProgress color="primary" />
      </Backdrop>
    </Container>
  );
};

export default AddUsers;
