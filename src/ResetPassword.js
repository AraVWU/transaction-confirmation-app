import React, { useState } from 'react';
import { apiFetch } from './api';
import { Box, Button, TextField, Typography, Alert, Paper } from '@mui/material';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    const res = await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }), // optionally add oldPassword
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Password updated successfully!');
      setNewPassword('');
    } else {
      setMessage(data.message || 'Failed to update password.');
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ maxWidth: 400, mx: 'auto', mt: 8, p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Reset Password
      </Typography>
      {message && (
        <Alert severity={message.startsWith('Password updated') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Update Password
        </Button>
      </form>
    </Box>
  );
}
