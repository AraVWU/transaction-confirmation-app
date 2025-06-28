import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { apiFetch } from './api';
import Register from './Register';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [tab, setTab] = useState(0);

  // Role change state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState(null);
  const [newRole, setNewRole] = useState('');

  const fetchUsers = async () => {
    const res = await apiFetch('/users');
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    const res = await apiFetch(`/users/${selectedUser}/password`, {
      method: 'PATCH',
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage('Password updated!');
      setNewPassword('');
      setSelectedUser(null);
    } else {
      setMessage(data.message || 'Failed to update password.');
    }
  };

  const handleRoleUpdate = async () => {
    const res = await apiFetch(`/users/${userToChangeRole._id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: newRole }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u._id === userToChangeRole._id ? { ...u, role: newRole } : u)));
      setMessage(`User role updated to ${newRole}!`);
      setRoleDialogOpen(false);
      setUserToChangeRole(null);
      setNewRole('');
    } else {
      setMessage(data.message || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async () => {
    const res = await apiFetch(`/users/${userToDelete._id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setMessage('User deleted.');
    } else {
      let msg = 'Failed to delete user.';
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {
        // response is not JSON
      }
      setMessage(msg);
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const openRoleDialog = (user) => {
    setUserToChangeRole(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          User Management
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="User List" />
          <Tab label="Register User" />
        </Tabs>
        {message && (
          <Alert
            severity={
              message.includes('updated!') || message.includes('updated to') || message.includes('deleted.')
                ? 'success'
                : 'error'
            }
            sx={{ mb: 2 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}
        {tab === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          backgroundColor:
                            user.role === 'admin'
                              ? 'error.main'
                              : user.role === 'accounting'
                              ? 'success.main'
                              : user.role === 'processTeam'
                              ? 'warning.main'
                              : 'primary.main',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                        }}
                      >
                        {user.role}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button variant="outlined" size="small" onClick={() => setSelectedUser(user._id)}>
                          Password
                        </Button>
                        <Button variant="outlined" size="small" color="primary" onClick={() => openRoleDialog(user)}>
                          Change Role
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => {
                            setUserToDelete(user);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {tab === 1 && <Register onRegister={fetchUsers} />}

        {/* Password Update Dialog */}
        <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)}>
          <DialogTitle>Update Password</DialogTitle>
          <form onSubmit={handlePasswordUpdate}>
            <DialogContent>
              <TextField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                autoFocus
                sx={{ mt: 1 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedUser(null)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Role Change Dialog */}
        <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)}>
          <DialogTitle>Change User Role</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Change role for user: <strong>{userToChangeRole?.email}</strong>
            </DialogContentText>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select value={newRole} label="Role" onChange={(e) => setNewRole(e.target.value)}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="accounting">Accounting</MenuItem>
                <MenuItem value="customerService">Customer Service</MenuItem>
                <MenuItem value="processTeam">Process Team</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleRoleUpdate}
              variant="contained"
              disabled={!newRole || newRole === userToChangeRole?.role}
            >
              Update Role
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete user <strong>{userToDelete?.email}</strong>? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}
