import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useUser } from "../../../../hooks/useUser";

/**
 * Generic modal for editing (or creating) an evaluation form.
 * @param {object} props
 * @param {boolean} props.open - Whether the dialog is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {string} [props.initialName] - Initial form name for editing.
 * @param {number} [props.formId] - Optional form ID for editing.
 * @param {function} [props.onSuccess] - Callback after successful save.
 * @param {string} [props.mode] - 'edit' or 'create'
 */
const PerformanceEvaluationEditModal = ({
  open,
  onClose,
  initialName = '',
  formId = null,
  onSuccess,
  mode = 'edit'
}) => {
  const { user } = useUser();
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [formName, setFormName] = useState(initialName);
  const [formNameError, setFormNameError] = useState(false);

  useEffect(() => {
    setFormName(initialName || '');
    setFormNameError(false);
  }, [initialName, open]);

  const handleCancel = () => {
    setFormName(initialName || '');
    setFormNameError(false);
    onClose();
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (!formName.trim()) {
      setFormNameError(true);
      Swal.fire({
        text: "Evaluation Form Name is required!",
        icon: "error",
        confirmButtonColor: '#177604'
      });
      return;
    } else {
      setFormNameError(false);
    }

    onClose(); // Close modal before confirmation

    Swal.fire({
      title: "Are you sure?",
      text: `You want to ${mode === 'edit' ? 'save changes to' : 'create'} this evaluation form?`,
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: 'Save',
      confirmButtonColor: '#177604',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          // Prepare data
          let data, endpoint;
          if (mode === 'edit' && formId) {
            data = new FormData();
            data.append('id', formId);
            data.append('name', formName);
            endpoint = '/editEvaluationForm';
          } else {
            data = { name: formName };
            endpoint = '/saveEvaluationForm';
          }
          const response = await axiosInstance.post(endpoint, data, { headers });
          if (response.data.status.toString().startsWith('2')) {
            await Swal.fire({
              text: response.data.message || "Evaluation form saved successfully!",
              icon: "success",
              timer: 1000,
              confirmButtonColor: '#177604',
              customClass: {
                popup: 'swal-popup-overlay'
              }
            });
            setFormName('');
            if (onSuccess) onSuccess(formName);
          } else {
            Swal.fire({
              text: response.data.message || "Something went wrong.",
              icon: "error",
              confirmButtonColor: '#177604'
            });
          }
        } catch (error) {
          Swal.fire({
            text: "Failed to save evaluation form.",
            icon: "error",
            timer: 1000,
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604'
          });
          console.error('Error:', error);
        }
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 10,
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          minWidth: 400,
          maxWidth: 800,
          backgroundColor: '#f8f9fa',
        }
      }}
      sx={{
        '& .MuiPaper-root': {
          width: '1000px',
          height: '340px',
          px: 3,
        },
      }}
    >
      <DialogTitle sx={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'left',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 'bold',
          }}
        >
          {mode === 'edit' ? 'EDIT EVALUATION FORM' : 'CREATE EVALUATION FORM'}
        </Typography>
        <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }}></Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1, mb: 4 }}>
          <TextField
            label="Evaluation Form Name*"
            variant="outlined"
            fullWidth
            value={formName}
            error={formNameError}
            onChange={e => setFormName(e.target.value)}
            sx={{ mb: 4 }}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<CloseIcon sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                stroke: 'white',
                strokeWidth: 2,
                fill: 'none'
              }} />}
              onClick={handleCancel}
              sx={{
                backgroundColor: '#727F91',
                color: 'white',
                width: '120px',
                height: '35px',
                fontSize: '14px',
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                stroke: 'white',
                strokeWidth: 2,
                fill: 'none'
              }} />}
              onClick={handleSave}
              sx={{
                backgroundColor: '#177604',
                color: 'white',
                width: '120px',
                height: '35px',
                fontSize: '14px',
              }}
            >
              SAVE
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceEvaluationEditModal;