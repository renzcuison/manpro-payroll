import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  Paper
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  LinearScale as LinearScaleIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  CheckBox as CheckBoxIcon,
  ShortText as ShortTextIcon,
  TextFields as TextFieldsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormAddCategory from './Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationFormSaveEvaluation from './Modals/PerformanceEvaluationFormSaveEvaluation';
import PerformanceEvaluationFormAcknowledge from './Modals/PerformanceEvaluationFormAcknowledge';
import PerformanceEvaluationFormAddSubcategory from './Modals/PerformanceEvaluationFormAddSubcategory';

const PerformanceEvaluationForm = () => {
  const [openModal, setOpenModal] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [saveEvaluationOpen, setSaveEvaluationOpen] = useState(false);
  const [acknowledgeOpen, setAcknowledgeOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = (subcategory) => {
    setEditingSubcategory(subcategory);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleLinearScaleChange = (subcategoryId, value) => {
    setSubCategories(subCategories.map((subcategory) =>
      subcategory.id === subcategoryId
        ? { ...subcategory, selectedValue: value }
        : subcategory
    ));
  };

  const handleSaveSubcategory = (updatedSubcategory) => {
    if (editingSubcategory) {
      setSubCategories(subCategories.map(sc =>
        sc.id === editingSubcategory.id ? { ...sc, ...updatedSubcategory } : sc
      ));
    } else {
      setSubCategories([...subCategories, { id: Date.now(), ...updatedSubcategory }]);
    }
    setEditingSubcategory(null);
    setOpenModal(false);
  };

  const handleMultipleChoiceChange = (subcategoryId, value) => {
  // Update only the subcategory with the matching subcategoryId
  setSubCategories(prevState =>
    prevState.map((subcategory) =>
      subcategory.id === subcategoryId
        ? { ...subcategory, selectedValue: value } // Set the selected value for the clicked subcategory
        : subcategory
    )
  );
};



  const handleSettings = () => {
    alert('Settings clicked!');
  };

  const handleAddSection = () => setAddSectionOpen(true);
  const handleAddCategory = () => setAddCategoryOpen(true);
  const handleSaveEvaluation = () => setSaveEvaluationOpen(true);

  return (
    <Layout title="Performance Evaluation Form">
      <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 5, p: 3, bgcolor: 'white', borderRadius: '8px', position: 'relative' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>Performance Evaluation Form</Typography>

        {/* Settings Icon */}
        <IconButton sx={{ position: 'absolute', top: 24, right: 24 }} onClick={handleSettings}>
          <SettingsIcon sx={{ color: '#bdbdbd', fontSize: 32 }} />
        </IconButton>

        {/* List of saved sub-categories */}
        {subCategories.map((subcategory) => (
          <Box
            key={subcategory.id}
            sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, cursor: 'pointer' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleOpenModal(subcategory); // Open modal only when the box is clicked
              }
            }}
          >
            <Typography variant="h6">{subcategory.subcategoryName}</Typography>
            <Typography variant="body1">Response Type: {subcategory.responseType}</Typography>
            <Typography variant="body2">Description: {subcategory.description}</Typography>

            {subcategory.responseType === 'linearScale' && (
              <Box sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2} justifyContent='center'>
                  <Grid item><Typography variant="body1">{subcategory.label1}</Typography></Grid>
                  <Grid item xs>
                    <Grid container justifyContent="center" spacing={1}>
                      {[...Array(subcategory.maxValue - subcategory.minValue + 1)].map((_, index) => {
                        const value = subcategory.minValue + index;
                        return (
                          <Grid item key={value}>
                            <FormControlLabel
                              control={<Radio checked={subcategory.selectedValue === value.toString()} onChange={() => handleLinearScaleChange(subcategory.id, value.toString())} value={value.toString()} />}
                              label={value}
                              labelPlacement="top"
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                  <Grid item><Typography variant="body1">{subcategory.label2}</Typography></Grid>
                </Grid>
              </Box>
            )}

{subcategory.responseType === 'multipleChoice' && (
  <Box sx={{ mb: 2 }}>
    <RadioGroup
      value={subcategory.selectedValue || ''} // This ensures only one radio button is selected
      onChange={(e) => handleMultipleChoiceChange(subcategory.id, e.target.value)} // Handle change by updating the correct subcategory's selectedValue
    >
      {subcategory.options.map((option, index) => (
        <FormControlLabel
          key={index}
          value={option} // Each radio button gets a unique value
          control={<Radio />}
          label={option}
        />
      ))}
    </RadioGroup>
  </Box>
)}



            {/* Render Checkbox */}
            {subcategory.responseType === 'checkbox' && (
              <Box sx={{ mb: 2 }}>
                {subcategory.options.map((option, index) => (
                  <FormControlLabel key={index} control={<Checkbox />} label={option} />
                ))}
              </Box>
            )}

            {/* Render Short Text and Long Text */}
            {subcategory.responseType === 'shortText' || subcategory.responseType === 'longText' ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Your Response"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={subcategory.userResponse || ''}
                  onChange={(e) => {}}
                />
              </Box>
            ) : null}
          </Box>
        ))}

        {/* Modals */}
        <PerformanceEvaluationFormAddSubcategory
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveSubcategory}
          subcategory={editingSubcategory || {}}
        />
        <PerformanceEvaluationFormAddSection open={addSectionOpen} onClose={() => setAddSectionOpen(false)} onSave={() => {}} />
        <PerformanceEvaluationFormAddCategory open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} onSave={() => {}} />
        <PerformanceEvaluationFormSaveEvaluation open={saveEvaluationOpen} onClose={() => setSaveEvaluationOpen(false)} onProceed={() => setSaveEvaluationOpen(false)} />
        <PerformanceEvaluationFormAcknowledge open={acknowledgeOpen} onClose={() => setAcknowledgeOpen(false)} />

        {/* Add Section, Add Category, Save Evaluation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', px: 4, py: 1.5 }} onClick={handleAddSection}>ADD SECTION</Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', px: 4, py: 1.5 }} onClick={handleAddCategory}>ADD CATEGORY</Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', px: 4, py: 1.5 }} onClick={handleSaveEvaluation}>SAVE EVALUATION</Button>
        </Box>
        {/* The correct button for adding sub-category */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', px: 4, py: 1.5 }} onClick={() => setOpenModal(true)}>Add Sub-Category</Button>
        </Box>
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationForm;