import React, { useState } from 'react';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogActions, DialogContent, Grid, TextField, Typography, CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Checkbox } from '@mui/material';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from 'sweetalert2';


const AnnouncementTypeEdit = ({ type, onClose, onSuccess }) => {
  const [name, setName] = useState(type.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameError, setNameError] = useState(false);

  const checkInput = (event) => {
          event.preventDefault();
  
          setNameError(!name);

          if (!name) {
              Swal.fire({
                  customClass: { container: 'my-swal' },
                  text: "All required fields must be filled!",
                  icon: "error",
                  showConfirmButton: true,
                  confirmButtonColor: '#177604',
              });
          } else {
              document.activeElement.blur();
              Swal.fire({
                  customClass: { container: "my-swal" },
                  title: "Are you sure?",
                  text: "This announcement type will be updated.",
                  icon: "warning",
                  showConfirmButton: true,
                  confirmButtonText: "Update",
                  confirmButtonColor: "#177604",
                  showCancelButton: true,
                  cancelButtonText: "Cancel",
              }).then((res) => {
                  if (res.isConfirmed) {
                      handleSubmit(event);
                  }
              });
          }
      };

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
        Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Announcement Type updated successfully!",
            icon: "success",
            showConfirmButton: true,
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604',
        }).then(() => {
            onClose();
        });
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
    <Dialog
      open={open}
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
      }}>
      <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h4" sx={{ marginLeft: 1, fontWeight: 'bold' }}> Edit Announcement Type </Typography>
              <IconButton onClick={onClose}><i className="si si-close"></i></IconButton>
          </Box>
      </DialogTitle>
      <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
              <Box component="form" onSubmit={checkInput} sx={{ mt: 3, my: 3 }} noValidate autoComplete="off" encType="multipart/form-data" >
                  <FormGroup row={true} className="d-flex justify-content-between" sx={{
                      '& label.Mui-focused': { color: '#97a5ba' },
                      '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                  }}>
                      <FormControl sx={{
                          mt: 1,
                          marginBottom: 3, width: '100%', '& label.Mui-focused': { color: '#97a5ba' },
                          '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#97a5ba' } },
                      }} onSubmit={handleSubmit} >
                          <TextField
                              required
                              id="name" 
                              label="Name"
                              variant="outlined"
                              value={name}
                              error={nameError}
                              onChange={(e) => setName(e.target.value)}
                          />
                      </FormControl>
                  </FormGroup>
                <DialogActions>
                  <Box display="flex" justifyContent="center" sx={{ marginTop: '20px' }}>
                    <Button type="submit" variant="contained" sx={{ backgroundColor: '#177604', color: 'white' }} className="m-1">
                        <p className='m-0'><i className="fa fa-floppy-o mr-2 mt-1"></i> Update Announcement Type </p>
                    </Button>
                  </Box>
                </DialogActions>
              </Box>
          </DialogContent>
      </Dialog >
  );
};

export default AnnouncementTypeEdit;