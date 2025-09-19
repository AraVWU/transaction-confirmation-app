import React, { useState } from 'react';
import { register } from './api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

export default function Register({ onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('accounting');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const res = await register(normalizedEmail, password, role);
    if (res.success) {
      setMessage('Registration successful! You can now log in.');
      setEmail('');
      setPassword('');
      setRole('accounting');
      if (onRegister) onRegister(); // <-- call parent refresh
    } else {
      setMessage(res.message || 'Registration failed.');
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Register
      </Typography>
      {message && (
        <Alert severity={message.startsWith('Registration successful') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel id="role-label">Role</InputLabel>
          <Select labelId="role-label" value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
            <MenuItem value="accounting">Accounting</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="customerService">Customer Service</MenuItem>
            <MenuItem value="processTeam">Process Team</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Register
        </Button>
      </form>
    </Box>
  );
}
