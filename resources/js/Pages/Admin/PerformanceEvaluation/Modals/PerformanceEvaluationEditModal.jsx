import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import Swal from "sweetalert2";
import axiosInstance, { getJWTHeader } from "../../../../utils/axiosConfig";
import { useUser } from "../../../../hooks/useUser";
import DeleteIcon from '@mui/icons-material/Delete';

const PerformanceEvaluationEditModal = ({
  open,
  onClose,
  initialName = '',
  formId = null,
  onSuccess,
  mode = 'edit',
}) => {
  const { user } = useUser();
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [formName, setFormName] = useState(initialName);
  const [formNameError, setFormNameError] = useState(false);
  const [sections, setSections] = useState([]);

  // Fetch sections
  const fetchSections = async () => {
    if (!formId) return;
    try {
      const response = await axiosInstance.get('/getEvaluationForm', {
        params: { id: formId },
        headers,
      });
      if (
        response.data.status === 200 &&
        response.data.evaluationForm &&
        Array.isArray(response.data.evaluationForm.sections)
      ) {
        setSections(response.data.evaluationForm.sections);
      } else {
        setSections([]);
      }
    } catch (err) {
      setSections([]);
      console.error("Failed to fetch sections", err);
    }
  };

  useEffect(() => {
    setFormName(initialName || '');
    setFormNameError(false);
  }, [initialName, open]);

  useEffect(() => {
    if (open && formId) {
      fetchSections();
    }
  }, [open, formId]);

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
          if (response.data.status && response.data.status.toString().startsWith('2')) {
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
            fetchSections(); // Refresh sections in case name changed
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

  const handleDeleteSection = async (sectionId, sectionName) => {
    const result = await Swal.fire({
      title: "Delete Section?",
      text: `Are you sure you want to delete "${sectionName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Delete"
    });
    if (!result.isConfirmed) return;
    try {
      const response = await axiosInstance.post(
        '/deleteEvaluationFormSection',
        { id: sectionId },
        { headers }
      );
      if (response.data.status && response.data.status.toString().startsWith('2')) {
        Swal.fire("Deleted!", "Section deleted!", "success");
        fetchSections(); // Refresh after delete!
        if (onSuccess) onSuccess(formName);
      } else {
        Swal.fire("Error", response.data.message || "Failed to delete section", "error");
      }
    } catch (e) {
      Swal.fire("Error", "Failed to delete section", "error");
      console.error(e);
    }
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
          height: 'auto',
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
          {sections && !!sections.length && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Sections
            </Typography>
            {sections.map(section => (
              <Box
                key={section.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  pl: 1,
                  pr: 1,
                  borderRadius: 1,
                  border: '1px solid #e0e0e0',
                  background: 'transparent',
                  transition: 'background 0.2s',
                  '&:hover': {
                    background: '#f4f6f8',
                  },
                }}
              >
                <Typography sx={{ flex: 1, py: 1, color: '#38404A' }}>{section.name}</Typography>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteSection(section.id, section.name)}
                  sx={{
                    color: 'gray',
                    ml: 1,
                    '&:hover': { background: 'rgba(183,28,28,0.08)' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>
          )}
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