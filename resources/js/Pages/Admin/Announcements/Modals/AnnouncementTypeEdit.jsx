import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from '@mui/material';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

const AnnouncementTypeEdit = ({ type, onClose, onSuccess }) => {
  const [name, setName] = useState(type.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const storedUser = localStorage.getItem("nasya_user");
      const headers = storedUser ? getJWTHeader(JSON.parse(storedUser)) : {};

      const response = await axiosInstance.put(
        '/updateAnnouncementType',
        { id: type.id, name },
        { headers }
      );
      const data = response.data;
      if (response.status === 200 && data.status === 200) {
        if (onSuccess) onSuccess(data.type);
        onClose();
      } else if (data.errors) {
        setError(data.errors.name ? data.errors.name[0] : 'Validation error');
      } else if (data.message) {
        setError(data.message);
      } else {
        setError('An error occurred.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Announcement Type</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Type Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
            disabled={loading}
            margin="normal"
          />
          {error && <div style={{color: 'red', marginTop: 8}}>{error}</div>}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading || !name} variant="contained" color="primary">
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AnnouncementTypeEdit;