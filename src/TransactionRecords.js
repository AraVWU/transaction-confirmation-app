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
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { Link } from 'react-router';
import { apiFetch } from './api'; // Add this import at the top

export default function TransactionRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState(0); // 0: Unconfirmed, 1: All, 2: Refund Requests
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Refund dialog state
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundId, setRefundId] = useState(null);
  const [refundMessage, setRefundMessage] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      const res = await apiFetch('/transactions');
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchRecords();
  }, [tab]);

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);
  }, []);

  const handleConfirmClick = (id) => {
    setSelectedId(id);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    await apiFetch(`/transactions/${selectedId}/confirm`, {
      method: 'PATCH',
    });
    setRecords((prev) => prev.map((rec) => (rec._id === selectedId ? { ...rec, confirmed: true } : rec)));
    setConfirmDialogOpen(false);
    setSelectedId(null);
  };

  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
    setSelectedId(null);
  };

  // Refund handlers
  const handleRefundClick = (id) => {
    setRefundId(id);
    setRefundDialogOpen(true);
  };

  const handleRefund = async () => {
    await apiFetch(`/transactions/${refundId}/refund`, {
      method: 'PATCH',
      body: JSON.stringify({ message: refundMessage }),
    });
    // Fetch latest records from backend
    const res = await apiFetch('/transactions');
    const data = await res.json();
    setRecords(data);

    setRefundDialogOpen(false);
    setRefundId(null);
    setRefundMessage('');
  };

  const handleRefundDialogClose = () => {
    setRefundDialogOpen(false);
    setRefundId(null);
  };

  // Delete handlers
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    await apiFetch(`/transactions/${deleteId}`, { method: 'DELETE' });
    setRecords((prev) => prev.filter((r) => r._id !== deleteId));
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  // Filter records based on tab and search input
  const filteredRecords = records
    .filter((rec) => {
      if (tab === 0) return !rec.confirmed;
      if (tab === 1) return true;
      if (tab === 2) return rec.refundRequested === true;
      return true;
    })
    .filter((rec) =>
      [rec.email, rec.orderNumber, rec.transactionNumber].some(
        (field) => field && field.toLowerCase().includes(search.toLowerCase())
      )
    );

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 5, mb: 5 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          {tab === 0 ? 'Unconfirmed Transactions' : tab === 1 ? 'All Transactions' : 'Refund Request Transactions'}
        </Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Unconfirmed Transactions" />
          <Tab label="All Transactions" />
          <Tab label="Refund Request Transactions" />
        </Tabs>
        <TextField
          label="Search by email, order number, or transaction number"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ mb: 3 }}
        />
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 0 }}>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead sx={{ position: 'sticky', top: 0, bgcolor: '#f7f7fa', zIndex: 1 }}>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Order #</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Transaction #</TableCell>
                <TableCell>Time</TableCell>
                {tab === 1 && <TableCell>Confirmed</TableCell>}
                {tab === 1 && <TableCell>Refunded</TableCell>}
                {tab === 2 && <TableCell>Comments</TableCell>}
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((rec) => (
                <TableRow
                  key={rec._id}
                  sx={{
                    bgcolor: !rec.confirmed && tab === 0 ? '#fffde7' : undefined,
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <TableCell>{rec.email}</TableCell>
                  <TableCell>{rec.orderNumber}</TableCell>
                  <TableCell>${rec.amount}</TableCell>
                  <TableCell>{rec.transactionNumber}</TableCell>
                  <TableCell>{rec.createdAt ? new Date(rec.createdAt).toLocaleString() : ''}</TableCell>
                  {tab === 1 && <TableCell>{rec.confirmed ? 'Yes' : 'No'}</TableCell>}
                  {tab === 1 && <TableCell>{rec.refunded ? 'Yes' : 'No'}</TableCell>}
                  {tab === 2 && (
                    <TableCell>
                      {rec.comments && rec.comments.length > 0 ? (
                        <ul style={{ paddingLeft: 16, margin: 0 }}>
                          {rec.comments.map((c) => (
                            <li key={c._id}>
                              <strong>{c.author?.email || 'User'}:</strong> {c.message}
                              <br />
                              <span style={{ fontSize: 12, color: '#888' }}>
                                {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: '#888' }}>No comments</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {userRole === 'accounting' && !rec.confirmed && tab === 0 && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleConfirmClick(rec._id)}
                        >
                          Confirm
                        </Button>
                      )}
                      <Button variant="outlined" size="small" component={Link} to={`/order/${rec.orderNumber}`}>
                        View Order
                      </Button>
                      {tab === 1 && !rec.refunded && !rec.refundRequested && (
                        <Button
                          variant="contained"
                          color="warning" // Changed from "error" to "warning"
                          size="small"
                          onClick={() => handleRefundClick(rec._id)}
                        >
                          Refund Request
                        </Button>
                      )}
                      {userRole === 'admin' && tab === 2 && (
                        <>
                          {!rec.refunded && rec.refundRequested && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={async () => {
                                  await apiFetch(`/transactions/${rec._id}/mark-refunded`, {
                                    method: 'PATCH',
                                  });
                                  setRecords((prev) =>
                                    prev.map((r) =>
                                      r._id === rec._id ? { ...r, refunded: true, refundRequested: false } : r
                                    )
                                  );
                                }}
                                sx={{ mr: 1 }}
                              >
                                Mark as Refunded
                              </Button>
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={async () => {
                                  await apiFetch(`/transactions/${rec._id}/cancel-refund`, {
                                    method: 'PATCH',
                                  });
                                  setRecords((prev) =>
                                    prev.map((r) => (r._id === rec._id ? { ...r, refundRequested: false } : r))
                                  );
                                }}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {userRole === 'admin' && tab === 1 && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(rec._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={tab === 1 ? 8 : 7} align="center">
                    <Typography color="text.secondary">No transactions found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={handleDialogClose} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Confirm Transaction</DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: '#f9f9f9' }}>
          <DialogContentText sx={{ mb: 2 }}>Are you sure you want to confirm this transaction?</DialogContentText>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Order Number:</strong> {selectedId && records.find((r) => r._id === selectedId)?.orderNumber}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Amount:</strong> ${selectedId && records.find((r) => r._id === selectedId)?.amount}
          </Typography>
          <Typography variant="body2" color="warning.main">
            This will also capture the invoice in Magento.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirm} color="success" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Refund Confirmation Dialog */}
      <Dialog open={refundDialogOpen} onClose={handleRefundDialogClose} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Refund Request</DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: '#f9f9f9' }}>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to request a refund for this transaction? Please provide a reason below.
          </DialogContentText>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Order Number:</strong> {refundId && records.find((r) => r._id === refundId)?.orderNumber}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Amount:</strong> ${refundId && records.find((r) => r._id === refundId)?.amount}
          </Typography>
          <TextField
            label="Reason for refund"
            value={refundMessage}
            onChange={(e) => setRefundMessage(e.target.value)}
            fullWidth
            required
            multiline
            minRows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRefundDialogClose}>Cancel</Button>
          <Button onClick={handleRefund} color="error" variant="contained" disabled={!refundMessage.trim()}>
            Request Refund
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>Delete Transaction</DialogTitle>
        <Divider />
        <DialogContent sx={{ bgcolor: '#f9f9f9' }}>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </DialogContentText>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Order Number:</strong> {deleteId && records.find((r) => r._id === deleteId)?.orderNumber}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Amount:</strong> ${deleteId && records.find((r) => r._id === deleteId)?.amount}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
