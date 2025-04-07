require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const qs = require('qs');
const nodemailer = require('nodemailer');
const app = express();

// Twilio Configuration
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eshop')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  shopName: { type: String, required: true },
  shopAddress: { type: String, required: true },
  garmentType: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  phoneVerified: { type: Boolean, default: false },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  password: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Employee Schema
const employeeSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, required: true },
  jobTitle: { type: String, required: true },
  dateOfJoining: { type: Date, required: true },
  salary: { type: Number, required: true },
  phoneNumber: { type: String, required: true },
  phoneVerified: { type: Boolean, default: false },
  alternatePhone: String,
  password: { type: String, required: true },
  termsAccepted: { type: Boolean, required: true },
  department: { type: String, required: true },
  employeeId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: false },
  address: { type: String, required: true },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  documents: {
    idProof: String,
    addressProof: String,
    photo: String
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String
  },
  status: { 
    type: String, 
    enum: ['Active', 'Inactive', 'On Leave'], 
    default: 'Active' 
  },
  createdAt: { type: Date, default: Date.now }
});

employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await Employee.countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

// Add this before the routes
const validatePhoneNumber = (phoneNumber) => {
  // Basic validation for international phone numbers
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

// Routes
app.post('/api/users', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    // Check if phone or email has changed
    const currentUser = await User.findById(req.params.id);
    const updates = req.body;
    
    // Reset verification flags if contact info changed
    if (currentUser.phoneNumber !== updates.phoneNumber) {
      updates.phoneVerified = false;
    }
    if (currentUser.email !== updates.email) {
      updates.emailVerified = false;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates,
      { new: true }
    );
    
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Employee Routes
app.post('/api/employees', async (req, res) => {
  try {
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  
  try {
    // Validate phone number format
    if (!validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ 
        error: 'Invalid phone number format. Please include country code (e.g. +91xxxxxxxxxx)' 
      });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Store OTP in memory with timestamp
    global.otpStore = global.otpStore || {};
    global.otpStore[phoneNumber] = {
      otp: otp,
      timestamp: Date.now()
    };

    // Send OTP via Twilio
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Messages.json`,
      qs.stringify({
        To: phoneNumber, // Send to the exact number provided
        From: FROM_NUMBER,
        Body: `Your verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`
      }),
      {
        auth: {
          username: ACCOUNT_SID,
          password: AUTH_TOKEN
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Remove OTP from response in production
    res.json({ 
      success: true, 
      message: `OTP sent successfully to ${phoneNumber}`,
      testOtp: otp // Remove this in production
    });
  } catch (error) {
    console.error('OTP Error:', error.response?.data || error.message);
    res.status(400).json({ 
      error: 'Failed to send OTP. Please check the phone number and try again.' 
    });
  }
});

app.post('/api/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  try {
    const storedData = global.otpStore[phoneNumber];
    
    // Check if OTP exists and is not expired (5 minutes validity)
    if (storedData && 
        storedData.otp.toString() === otp && 
        (Date.now() - storedData.timestamp) <= 300000) {
      
      delete global.otpStore[phoneNumber]; // Clear used OTP
      res.json({ verified: true });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/send-email-otp', async (req, res) => {
  const { email } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    global.emailOtpStore = global.emailOtpStore || {};
    global.emailOtpStore[email] = {
      otp: otp,
      timestamp: Date.now()
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a237e;">Email Verification</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #2e7d32; font-size: 36px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
          <p style="color: #d32f2f;">Do not share this code with anyone.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: `OTP sent successfully to ${email}`,
      testOtp: otp // Remove in production
    });
  } catch (error) {
    console.error('Email OTP Error:', error);
    res.status(400).json({ error: 'Failed to send email OTP' });
  }
});

app.post('/api/verify-email-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const storedData = global.emailOtpStore[email];
    
    if (storedData && 
        storedData.otp.toString() === otp && 
        (Date.now() - storedData.timestamp) <= 300000) {
      
      delete global.emailOtpStore[email];
      res.json({ verified: true });
    } else {
      res.status(400).json({ error: 'Invalid or expired OTP' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
