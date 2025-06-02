import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  IconButton,
  Typography
} from '@mui/material';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';

const EditBranchModal = ({ 
  open, 
  onClose, 
  branch, 
  setBranch, 
  headers, 
  id,
  setBranchData,
  setEmployees 
}) => {
  const handleUpdateBranch = async () => {
    try {
      const response = await axiosInstance.post('/settings/editBranch', branch, { headers });
      
      if (response.data.status === 200) {
        Swal.fire({
          customClass: { container: 'my-swal' },
          text: "Branch updated successfully!",
          icon: "success",
          showConfirmButton: true,
          confirmButtonText: 'Proceed',
          confirmButtonColor: '#177604',
        });
        onClose();
        const updatedResponse = await axiosInstance.get(`/settings/getBranch/${id}`, { headers });
        setBranchData(updatedResponse.data.branch);
        setEmployees(updatedResponse.data.employees || []);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Error updating branch!",
        icon: "error",
        showConfirmButton: true,
        confirmButtonColor: '#177604',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          padding: '16px',
          backgroundColor: '#f8f9fa',
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          borderRadius: '20px',
          minWidth: '800px',
          maxWidth: '1000px',
          marginBottom: '5%'
        }
      }}
    >
      <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}>Edit Branch</Typography>
          <IconButton onClick={onClose}>
            <i className="si si-close"></i>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
        <Box component="form" sx={{ mt: 3, my: 3 }} noValidate autoComplete="off">
          <FormGroup row={true} className="d-flex justify-content-between">
            <FormControl sx={{ marginBottom: 3, width: '49%' }}>
              <TextField
                required
                id="name"
                label="Name"
                variant="outlined"
                value={branch.name}
                onChange={(e) => setBranch({ ...branch, name: e.target.value })}
              />
            </FormControl>

            <FormControl sx={{ marginBottom: 3, width: '19%' }}>
              <TextField
                required
                id="acronym"
                label="Acronym"
                variant="outlined"
                value={branch.acronym}
                onChange={(e) => setBranch({ ...branch, acronym: e.target.value })}
              />
            </FormControl>

            <FormControl sx={{ marginBottom: 3, width: '19%' }}>
              <InputLabel id="branch-status-label">Status</InputLabel>
              <Select
                labelId="branch-status-label"
                id="branch-status"
                value={branch.status || 'Active'}
                label="Status"
                onChange={(e) => setBranch({ ...branch, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </FormGroup>

          <FormGroup row={true} className="d-flex justify-content-between">
            <FormControl sx={{ marginBottom: 3, width: '100%' }}>
              <TextField
                required
                id="address"
                label="Address"
                variant="outlined"
                value={branch.address}
                onChange={(e) => setBranch({ ...branch, address: e.target.value })}
                multiline
                rows={3}
              />
            </FormControl>
          </FormGroup>

          <FormGroup row={true} className="d-flex justify-content-between">
            <FormControl sx={{ marginBottom: 3, width: '49%' }}>
              <TextField
                required
                id="contact_number"
                label="Contact Number"
                variant="outlined"
                value={branch.contact_number}
                onChange={(e) => setBranch({ ...branch, contact_number: e.target.value })}
              />
            </FormControl>
          </FormGroup>

          <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#177604', color: 'white' }}
              onClick={handleUpdateBranch}
            >
              <i className="fa fa-floppy-o mr-2"></i> Update Branch
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EditBranchModal;