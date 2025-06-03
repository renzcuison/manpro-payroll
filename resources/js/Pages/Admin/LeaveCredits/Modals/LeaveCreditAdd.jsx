import {
  Box, Button, IconButton, Dialog, Typography, CircularProgress, TextField,
  MenuItem, FormControl, Stack
} from '@mui/material';

import React, { useState, useEffect } from 'react';
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import Swal from 'sweetalert2';

const LeaveCreditAdd = ({ open, close, empId, employee }) => {
  console.log(employee.name)
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [leaveType, setLeaveType] = useState('');
  const [leaveTypeSet, setLeaveTypeSet] = useState([]);
  const [creditCount, setCreditCount] = useState('');

  const [leaveTypeError, setLeaveTypeError] = useState(false);
  const [creditCountError, setCreditCountError] = useState(false);

  const [leaveCredits, setLeaveCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  const style = {
    p: 4,
    minWidth: '500px',
    borderRadius: 2,
    bgcolor: '#f8f9fa',
  };

  useEffect(() => {
    setLoading(true);
    axiosInstance.get(`applications/getApplicationTypes`, { headers })
      .then((response) => {
        setLeaveTypeSet(response.data.types);
      })
      .catch((error) => {
        console.error("Error fetching leave types:", error);
      });

    axiosInstance.get(`/applications/getLeaveCredits/${empId}`, { headers })
      .then((response) => {
        setLeaveCredits(response.data.leave_credits);
      })
      .catch((error) => {
        console.error('Error fetching leave credits:', error);
      })
      .finally(() => setLoading(false));
  }, [empId]);

  const checkInput = (event) => {
    event.preventDefault();

    setLeaveTypeError(!leaveType);
    setCreditCountError(!creditCount);

    if (!leaveType || !creditCount) {
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "All fields must be filled!",
        icon: "error",
        showConfirmButton: true,
        confirmButtonColor: '#177604',
      });
      return;
    }

    Swal.fire({
      customClass: { container: "my-swal" },
      title: "Are you sure?",
      text: "Do you want to add this leave credit?",
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
      app_type_id: leaveType,
      credit_count: creditCount,
    };

    axiosInstance.post('/applications/saveLeaveCredits', data, { headers })
      .then(response => {
        if (response.data.status === 200) {
          Swal.fire({
            customClass: { container: 'my-swal' },
            text: "Leave Credits added successfully!",
            icon: "success",
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604',
          }).then(() => {
            close();
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <Dialog open={open} onClose={close} aria-labelledby="add-leave-credit-title">
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" color="black" sx={{ fontWeight: 'bold' }}>
            Add Leave Credit
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
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <FormControl sx={{ flex: 2 }} error={leaveTypeError}>
                <TextField
                  select
                  label="Leave Type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  size="small"
                  fullWidth
                >
                  {leaveTypeSet
                    .filter(type => !leaveCredits.some(credit => credit.app_type_id === type.id))
                    .map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                </TextField>
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

export default LeaveCreditAdd;
