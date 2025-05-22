// src/Modals/Payroll/AddSignatoryModal.js

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, Button, Box,FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const AddSignatory = ({open,onClose,purpose,setPurpose,name,setName,position,setPosition,headers}) => {
  const options = [
    { label: 'Preparer', value: 'Preparer' },
    { label: 'Reviewer', value: 'Reviewer' },
    { label: 'Approver', value: 'Approver' },
  ];


  const handleSave = async () => {
    if (!name || !position || !purpose) {
      Swal.fire('Error', 'Please fill all the fields.', 'warning');
      return;
    }

    try {
      const payload = { purpose: purpose, name: name, position: position };

      await axiosInstance.post('/saveSignatory', payload, { headers });

      Swal.fire('Success', 'Signatory added successfully!', 'success');
      setPurpose('');
      setName('');
      setPosition('');
      onClose();
    } 
    catch (err) {
      console.error("Failed to add signatory", err);
      Swal.fire("Error", "Something went wrong while adding signatory", "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} sx={{zIndex: 1000}}>
      <DialogTitle>Add Signatory</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', width: 400}}>
        <FormControl fullWidth size="small"  sx={{mt:2}}>
          <InputLabel>Purpose</InputLabel>
          <Select
            label="Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          >
            {options.map((opt, idx) => (
              <MenuItem key={idx} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField 
          label="Name"
          variant="outlined"
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 2 }}  
        />

        <TextField 
          label="Position"
          variant="outlined"
          fullWidth
          size="small"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          sx={{ mt: 2 }}  
        />

        <Box item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button color='error' variant='outlined' onClick={onClose} sx={{ mr: 1}}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AddSignatory;
