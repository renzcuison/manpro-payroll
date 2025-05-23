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
import SubCategoryModal from './Modals/SubcategoryModal';

const PerformanceEvaluationForm = () => {
  const [openModal, setOpenModal] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [saveEvaluationOpen, setSaveEvaluationOpen] = useState(false);
  const [acknowledgeOpen, setAcknowledgeOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = (subCategory) => {
    setEditingSubCategory(subCategory);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleLinearScaleChange = (subCategoryId, value) => {
    setSubCategories(subCategories.map((subCategory) =>
      subCategory.id === subCategoryId
        ? { ...subCategory, selectedValue: value }
        : subCategory
    ));
  };

  const handleSaveSubCategory = (updatedSubCategory) => {
    if (editingSubCategory) {
      setSubCategories(subCategories.map(sc =>
        sc.id === editingSubCategory.id ? { ...sc, ...updatedSubCategory } : sc
      ));
    } else {
      setSubCategories([...subCategories, { id: Date.now(), ...updatedSubCategory }]);
    }
    setEditingSubCategory(null);
    setOpenModal(false);
  };

  const handleMultipleChoiceChange = (subCategoryId, value) => {
    setSubCategories(prevState =>
      prevState.map((subCategory) =>
        subCategory.id === subCategoryId
          ? { ...subCategory, selectedValue: value }
          : subCategory
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
        {subCategories.map((subCategory) => (
          <Box
            key={subCategory.id}
            sx={{ mb: 2, border: '1px solid #ddd', borderRadius: 2, p: 2, cursor: 'pointer' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleOpenModal(subCategory); // Open modal only when the box is clicked
              }
            }}
          >
            <Typography variant="h6">{subCategory.subCategoryName}</Typography>
            <Typography variant="body1">Response Type: {subCategory.responseType}</Typography>
            <Typography variant="body2">Description: {subCategory.description}</Typography>

            {subCategory.responseType === 'linearScale' && (
              <Box sx={{ mb: 2 }}>
                <Grid container alignItems="center" spacing={2} justifyContent='center'>
                  <Grid item><Typography variant="body1">{subCategory.label1}</Typography></Grid>
                  <Grid item xs>
                    <Grid container justifyContent="center" spacing={1}>
                      {[...Array(subCategory.maxValue - subCategory.minValue + 1)].map((_, index) => {
                        const value = subCategory.minValue + index;
                        return (
                          <Grid item key={value}>
                            <FormControlLabel
                              control={<Radio checked={subCategory.selectedValue === value.toString()} onChange={() => handleLinearScaleChange(subCategory.id, value.toString())} value={value.toString()} />}
                              label={value}
                              labelPlacement="top"
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                  <Grid item><Typography variant="body1">{subCategory.label2}</Typography></Grid>
                </Grid>
              </Box>
            )}

            {/* Render Multiple Choice */}
            {subCategory.responseType === 'multipleChoice' && (
              <Box sx={{ mb: 2 }}>
                <RadioGroup
                  value={subCategory.selectedValue || ''}
                  onChange={(e) => handleMultipleChoiceChange(subCategory.id, e.target.value)}
                >
                  {subCategory.options.map((option, index) => (
                    <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                  ))}
                </RadioGroup>
              </Box>
            )}

            {/* Render Checkbox */}
            {subCategory.responseType === 'checkbox' && (
              <Box sx={{ mb: 2 }}>
                {subCategory.options.map((option, index) => (
                  <FormControlLabel key={index} control={<Checkbox />} label={option} />
                ))}
              </Box>
            )}

            {/* Render Short Text and Long Text */}
            {subCategory.responseType === 'shortText' || subCategory.responseType === 'longText' ? (
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Your Response"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={subCategory.userResponse || ''}
                  onChange={(e) => {}}
                />
              </Box>
            ) : null}
          </Box>
        ))}

        {/* Modals */}
        <SubCategoryModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveSubCategory}
          subCategory={editingSubCategory || {}}
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
