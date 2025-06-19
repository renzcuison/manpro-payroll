import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";

/**
 * Reusable modal for confirming deletion of an evaluation form.
 * 
 * @param {object} props
 * @param {boolean} props.open - Whether the modal is open.
 * @param {function} props.onClose - Function to close the modal.
 * @param {number} props.formId - ID of the form to delete.
 * @param {function} [props.onSuccess] - Callback after successful deletion.
 * @param {string} [props.formName] - Name of the form (for display).
 */
const PerformanceEvaluationDeleteModal = ({
  open,
  onClose,
  formId,
  onSuccess,
  formName = ""
}) => {
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const handleDelete = async (event) => {
    event.preventDefault();
    onClose(); // Close dialog immediately

    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete the evaluation form${formName ? ` "${formName}"` : ""}?`,
      icon: "warning",
      showConfirmButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d32f2f',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const formData = new FormData();
          formData.append('id', formId);
          const response = await axiosInstance.post('/deleteEvaluationForm', formData, { headers });
          if (response.data.status === 200) {
            await Swal.fire({
              text: "Evaluation form deleted successfully!",
              icon: "success",
              confirmButtonText: 'Proceed',
              confirmButtonColor: '#177604',
            });
            if (onSuccess) onSuccess();
          } else {
            Swal.fire({
              text: response.data.message || "Failed to delete evaluation form.",
              icon: "error",
              confirmButtonColor: '#177604',
            });
          }
        } catch (error) {
          Swal.fire({
            text: "Failed to delete evaluation form.",
            icon: "error",
            confirmButtonText: 'Proceed',
            confirmButtonColor: '#177604'
          });
          console.error("Error while deleting form:", error);
        }
      }
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 10,
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          minWidth: 400,
          maxWidth: 600,
          backgroundColor: '#f8f9fa',
        }
      }}
      sx={{
        '& .MuiPaper-root': {
          width: '500px',
          px: 3,
        },
      }}
    >
      <DialogTitle sx={{ paddingTop: '40px', paddingBottom: '0px' }}>
        <Typography
          variant="h4"
          sx={{
            textAlign: 'left',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 'bold',
          }}
        >
          DELETE EVALUATION FORM
        </Typography>
        <Box sx={{ borderBottom: '1px solid #ccc', marginTop: '5px' }} />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Are you sure you want to delete the evaluation form
            {formName && <b> "{formName}"</b>}?
            
            This action cannot be undone.
          </Typography>
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
              onClick={onClose}
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
              color="error"
              startIcon={<DeleteIcon sx={{
                fontSize: '1rem',
                fontWeight: 'bold',
                stroke: 'white',
                strokeWidth: 2,
                fill: 'none'
              }} />}
              onClick={handleDelete}
              sx={{
                backgroundColor: '#d32f2f',
                color: 'white',
                width: '120px',
                height: '35px',
                fontSize: '14px',
              }}
            >
              DELETE
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceEvaluationDeleteModal;