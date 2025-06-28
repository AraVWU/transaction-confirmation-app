import React, { useEffect, useState } from 'react';
import { getNotificationSettings, updateNotificationSettings } from './api';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    accountingEmail: '',
    processTeamEmail: '',
    refundEmail: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getNotificationSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await updateNotificationSettings(settings);
      setMessage('Settings updated!');
    } catch (err) {
      setError('Error updating settings.');
    }
    setSaving(false);
  };

  if (loading) return <Box sx={{ mt: 4, textAlign: 'center' }}>Loading...</Box>;

  return (
    <Box
      component="form"
      onSubmit={handleSave}
      sx={{
        maxWidth: 420,
        mx: 'auto',
        mt: 6,
        bgcolor: '#fff',
        p: 4,
        borderRadius: 2,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', color: 'primary.main' }}>
        Notification Email Settings
      </Typography>

      <TextField
        label="Accounting Email(s)"
        helperText="For new transaction notifications"
        type="text"
        name="accountingEmail"
        value={Array.isArray(settings.accountingEmail) ? settings.accountingEmail.join(', ') : settings.accountingEmail}
        onChange={handleChange}
        required
        placeholder="email1@example.com, email2@example.com"
        fullWidth
      />

      <TextField
        label="Process Team Email(s)"
        helperText="For confirmed transaction notifications"
        type="text"
        name="processTeamEmail"
        value={
          Array.isArray(settings.processTeamEmail) ? settings.processTeamEmail.join(', ') : settings.processTeamEmail
        }
        onChange={handleChange}
        required
        placeholder="email1@example.com, email2@example.com"
        fullWidth
      />

      <TextField
        label="Refund Team Email(s)"
        helperText="For refund request notifications"
        type="text"
        name="refundEmail"
        value={Array.isArray(settings.refundEmail) ? settings.refundEmail.join(', ') : settings.refundEmail}
        onChange={handleChange}
        required
        placeholder="email1@example.com, email2@example.com"
        fullWidth
      />

      <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ mt: 2 }}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
