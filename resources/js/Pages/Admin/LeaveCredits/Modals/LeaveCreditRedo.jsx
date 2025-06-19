import {
  Box, Button, IconButton, Dialog, Typography, CircularProgress, TextField,
  FormControl, Stack
} from '@mui/material';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from 'sweetalert2';

const LeaveCreditRedo = ({ open, close, empId, employee, leaveTypeId, leaveTypeName, currentCredits }) => {
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  // leaveType is fixed, not editable, so just set from prop
  const [creditCount, setCreditCount] = useState(currentCredits !== undefined ? String(currentCredits) : '');
  const [creditCountError, setCreditCountError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [leaveTypeSet, setLeaveTypeSet] = useState([]); // to hold leave types if needed

  const style = {
    p: 4,
    minWidth: '500px',
    borderRadius: 2,
    bgcolor: '#f8f9fa',
  };

  // Fetch leave types on mount if you need it (currently you don't use this for editing, but keeping for future)
  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`applications/getApplicationTypes`, { headers })
      .then((response) => {
        setLeaveTypeSet(response.data.types);
      })
      .catch((error) => {
        console.error("Error fetching leave types:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Update credit count when prop changes
  useEffect(() => {
    setCreditCount(currentCredits !== undefined ? String(currentCredits) : '');
  }, [currentCredits]);

  const checkInput = (event) => {
    event.preventDefault();

    // Convert creditCount string to number safely
    const creditNumber = Number(creditCount);

    // Validate properly: creditCount must not be empty and >= 0
    const isInvalid = creditCount === '' || isNaN(creditNumber) || creditNumber < 0;

    setCreditCountError(isInvalid);

    if (isInvalid) {
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Please enter a valid credit count (0 or more)!",
        icon: "error",
        showConfirmButton: true,
        confirmButtonColor: '#177604',
      });
      return;
    }

    Swal.fire({
      customClass: { container: "my-swal" },
      title: "Are you sure?",
      text: `Do you want to update the leave credit for ${leaveTypeName}?`,
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: 'Save',
      confirmButtonColor: '#177604',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then((res) => {
      if (res.isConfirmed) {
        saveInput(event);
      }
    });
  };

  const saveInput = (event) => {
    event.preventDefault();

    const data = {
      emp_id: empId,
      app_type_id: leaveTypeId,
      credit_count: Number(creditCount), // convert here explicitly
    };

    setLoading(true);

    axiosInstance.post('/applications/updateLeaveCredits', data, { headers })
      .then(response => {
        if (response.data.status === 200) {
          Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Leave Credits updated successfully!",
            icon: "success",
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604',
          }).then(() => {
            close();
          });
        } else {
          Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Failed to update leave credits.",
            icon: "error",
            confirmButtonColor: '#177604',
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        Swal.fire({
          customClass: { container: 'my-swal' },
          text: "An error occurred while updating leave credits.",
          icon: "error",
          confirmButtonColor: '#177604',
        });
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={close} aria-labelledby="edit-leave-credit-title">
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" color="black" sx={{ fontWeight: 'bold' }}>
            Edit Leave Credit
          </Typography>
          <IconButton onClick={close}><i className="si si-close"></i></IconButton>
        </Box>

        {/* Employee Info */}
        <Stack spacing={0.5} sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Employee Name:
            <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
              {employee?.name || '-'}
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Branch:
            <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
              {employee?.branch || '-'}
            </Typography>
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Department:
            <Typography component="span" variant="body2" sx={{ fontWeight: 'normal', ml: 1 }}>
              {employee?.department || '-'}
            </Typography>
          </Typography>
        </Stack>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={checkInput} noValidate autoComplete="off">
            <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
              <FormControl sx={{ flex: 2 }}>
                <TextField
                  label="Leave Type"
                  value={leaveTypeName}
                  size="small"
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </FormControl>

              <FormControl sx={{ flex: 1 }} error={creditCountError}>
                <TextField
                  label="Credits"
                  type="number"
                  value={creditCount}
                  onChange={(e) => setCreditCount(e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 1 }}
                  fullWidth
                />
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button type="submit" variant="contained" sx={{ minWidth: 120, backgroundColor: '#177604' }}>
                Save
              </Button>
              <Button variant="outlined" onClick={close} sx={{ minWidth: 120 }}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default LeaveCreditRedo;
