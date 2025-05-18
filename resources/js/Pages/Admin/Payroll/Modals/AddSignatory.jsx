// src/Modals/Payroll/AddSignatoryModal.js

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, TextField, Button } from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const AddSignatory = ({
  open,
  onClose,
  preparedBy,
  setPreparedBy,
  approvedBy,
  setApprovedBy,
  reviewedBy,
  setReviewedBy,
  headers
}) => {

  const handleSave = async () => {
    if (!preparedBy || !approvedBy) {
      Swal.fire('Error', 'Please fill in both Prepared By and Approved By fields.', 'warning');
      return;
    }

    try {
      const payload = { prepared_by: preparedBy, approved_by_one: approvedBy, reviewed_by: reviewedBy };

      await axiosInstance.post('/addSignatory', payload, { headers });

      Swal.fire('Success', 'Signatory added successfully!', 'success');
      setPreparedBy('');
      setApprovedBy('');
      setReviewedBy('');
      onClose();
    } catch (err) {
      console.error("Failed to add signatory", err);
      Swal.fire("Error", "Something went wrong while adding signatory", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Signatory</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1, display: 'flex', flexDirection: 'column', width: '300px' }}>
          <Grid item xs={12}>
            <TextField label="Prepared By" fullWidth value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)}/>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Reviewed By" fullWidth value={reviewedBy} onChange={(e) => setReviewedBy(e.target.value)} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Approved By" fullWidth value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button color='error' variant='outlined' onClick={onClose} sx={{ mr: 1}}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save</Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default AddSignatory;
