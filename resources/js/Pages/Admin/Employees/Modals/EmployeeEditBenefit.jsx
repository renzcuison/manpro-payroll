import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  Typography, 
  FormGroup, 
  FormControl,
  MenuItem,
  CircularProgress
} from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EmployeeEditBenefit = ({ open, close, userName, benefitData, allBenefits }) => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("nasya_user");
  const headers = getJWTHeader(JSON.parse(storedUser));

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    benefit: false,
    number: false
  });
  
  const [formData, setFormData] = useState({
    benefit_id: '',
    number: ''
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (benefitData) {
      setIsEditing(true);
      setFormData({
        benefit_id: benefitData.benefit_id,
        number: benefitData.number
      });
    } else {
      setIsEditing(false);
      setFormData({
        benefit_id: '',
        number: ''
      });
    }
  }, [benefitData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      benefit: !formData.benefit_id,
      number: !formData.number
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "Please fill in all required fields!",
        icon: "error",
        confirmButtonColor: '#177604',
      });
      return;
    }

    const confirmation = await Swal.fire({
      customClass: { container: 'my-swal' },
      title: "Are you sure?",
      text: isEditing 
        ? "You want to update this benefit?" 
        : "You want to add this benefit?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: '#177604',
      cancelButtonColor: '#d33',
      confirmButtonText: isEditing ? 'Update' : 'Save',
    });

    if (!confirmation.isConfirmed) return;

    try {
      setLoading(true);
      
      const payload = {
        userName,
        benefit_id: formData.benefit_id,
        number: formData.number
      };

      if (isEditing) {
        payload.id = benefitData.id;
      }

      const endpoint = isEditing 
        ? '/benefits/updateEmployeeBenefit' 
        : '/benefits/addEmployeeBenefit';

      const response = await axiosInstance.post(endpoint, payload, { headers });

      if (response.data.status === 200) {
        Swal.fire({
          customClass: { container: 'my-swal' },
          text: isEditing 
            ? "Benefit updated successfully!" 
            : "Benefit added successfully!",
          icon: "success",
          confirmButtonColor: '#177604',
        });
        close(true);
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        customClass: { container: 'my-swal' },
        text: "An error occurred. Please try again.",
        icon: "error",
        confirmButtonColor: '#177604',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth="md" 
      onClose={() => close(false)}
      PaperProps={{ 
        style: { 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '20px', 
          minWidth: '800px' 
        } 
      }}
    >
      <DialogTitle sx={{ padding: 4, paddingBottom: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {isEditing ? 'Edit Benefit' : 'Add Benefit'}
          </Typography>
          <IconButton onClick={() => close(false)}>
            <i className="si si-close"></i>
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ padding: 5, paddingBottom: 1 }}>
        <Box 
          component="form" 
          sx={{ mt: 3, my: 3 }} 
          onSubmit={handleSubmit}
          noValidate
        >
          <FormGroup row sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            '& .MuiFormControl-root': {
              mb: 3
            }
          }}>
            <FormControl sx={{ width: '29%' }}>
              <TextField
                select
                required
                name="benefit_id"
                label="Benefit"
                value={formData.benefit_id}
                error={errors.benefit}
                onChange={handleChange}
                helperText={errors.benefit && "Please select a benefit"}
              >
                {allBenefits.map((benefit) => (
                  <MenuItem key={benefit.id} value={benefit.id}>
                    {benefit.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl sx={{ width: '69%' }}>
              <TextField
                required
                name="number"
                label="Number"
                value={formData.number}
                error={errors.number}
                onChange={handleChange}
                helperText={errors.number && "Please enter a number"}
              />
            </FormControl>
          </FormGroup>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3 
          }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                backgroundColor: '#177604', 
                color: 'white',
                minWidth: '200px',
                '&:hover': {
                  backgroundColor: '#126103'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <>
                  <i className={`fa ${isEditing ? 'fa-pencil' : 'fa-floppy-o'} mr-2`}></i>
                  {isEditing ? 'Update Benefit' : 'Save Benefit'}
                </>
              )}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeEditBenefit;
