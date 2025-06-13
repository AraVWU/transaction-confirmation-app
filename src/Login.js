import React, { useState } from 'react';
import { login } from './api';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.success) {
      // Optionally store role/email if needed for UI (not for auth)
      localStorage.setItem('role', res.role);
      localStorage.setItem('email', res.email);
      onLogin({ ...res, role: res.role, email: res.email });
      navigate('/records');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Login
        </Button>
      </form>
    </Box>
  );
}
