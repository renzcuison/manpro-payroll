import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  LinearScale as LinearScaleIcon,
  CheckBox as CheckBoxIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  ShortText as ShortTextIcon,
  TextFields as TextFieldsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Layout from '../../../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';
import PerformanceEvaluationFormAddSection from './Modals/PerformanceEvaluationFormAddSection';
import PerformanceEvaluationFormAddCategory from './Modals/PerformanceEvaluationFormAddCategory';
import PerformanceEvaluationFormSaveEvaluation from './Modals/PerformanceEvaluationFormSaveEvaluation';

const SubCategoryModal = ({ open, onClose, onSave, subCategory }) => {
  const [subCategoryName, setSubCategoryName] = useState(subCategory?.subCategoryName || '');
  const [responseType, setResponseType] = useState(subCategory?.responseType || '');
  const [description, setDescription] = useState(subCategory?.description || '');
  const [options, setOptions] = useState(subCategory?.options || []);
  const [label1, setLabel1] = useState(subCategory?.label1 || '');
  const [label2, setLabel2] = useState(subCategory?.label2 || '');
  const [minValue, setMinValue] = useState(subCategory?.minValue || 1);
  const [maxValue, setMaxValue] = useState(subCategory?.maxValue || 5);

  const handleSave = () => {
    onSave({ subCategoryName, responseType, description, options, label1, label2, minValue, maxValue });
    onClose();
  };

  const handleOptionChange = (index, event) => {
    const newOptions = [...options];
    newOptions[index] = event.target.value;
    setOptions(newOptions);
  };

  const handleAddOption = () => setOptions([...options, '']);
  const handleRemoveOption = (index) => setOptions(options.filter((_, i) => i !== index));

  return (
    open && (
      <Box sx={{ p: 3, bgcolor: 'white', borderRadius: '8px', maxWidth: '500px', mx: 'auto' }}>
        <Typography variant="h6">Add/Edit Sub-Category</Typography>
        <TextField label="Sub-Category Name" fullWidth value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} sx={{ mb: 2 }} />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Response Type</InputLabel>
          <Select value={responseType} onChange={(e) => setResponseType(e.target.value)} label="Response Type">
            <MenuItem value="linearScale"><LinearScaleIcon sx={{ mr: 2 }} /> Linear Scale</MenuItem>
            <MenuItem value="multipleChoice"><RadioButtonCheckedIcon sx={{ mr: 2 }} /> Multiple Choice</MenuItem>
            <MenuItem value="checkbox"><CheckBoxIcon sx={{ mr: 2 }} /> Checkbox</MenuItem>
            <MenuItem value="shortText"><ShortTextIcon sx={{ mr: 2 }} /> Short Text</MenuItem>
            <MenuItem value="longText"><TextFieldsIcon sx={{ mr: 2 }} /> Long Text</MenuItem>
          </Select>
        </FormControl>

        {responseType === 'linearScale' && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={5}><FormControl fullWidth><InputLabel>Min Value</InputLabel><Select value={minValue} onChange={(e) => setMinValue(e.target.value)}><MenuItem value={0}>0</MenuItem><MenuItem value={1}>1</MenuItem><MenuItem value={2}>2</MenuItem></Select></FormControl></Grid>
              <Grid item xs={2}><Typography variant="h6" align="center">to</Typography></Grid>
              <Grid item xs={5}><FormControl fullWidth><InputLabel>Max Value</InputLabel><Select value={maxValue} onChange={(e) => setMaxValue(e.target.value)}><MenuItem value={3}>3</MenuItem><MenuItem value={4}>4</MenuItem><MenuItem value={5}>5</MenuItem></Select></FormControl></Grid>
            </Grid>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}><TextField label="Min Label" fullWidth value={label1} onChange={(e) => setLabel1(e.target.value)} /></Grid>
              <Grid item xs={6}><TextField label="Max Label" fullWidth value={label2} onChange={(e) => setLabel2(e.target.value)} /></Grid>
            </Grid>
          </>
        )}

        {(responseType === 'multipleChoice' || responseType === 'checkbox') && (
          <Box>
            {options.map((option, i) => (
              <Grid container spacing={1} key={i}>
                <Grid item xs={10}><TextField fullWidth value={option} onChange={(e) => handleOptionChange(i, e)} /></Grid>
                <Grid item xs={2}><IconButton onClick={() => handleRemoveOption(i)}><CloseIcon /></IconButton></Grid>
              </Grid>
            ))}
            <Button onClick={handleAddOption}>Add Option</Button>
          </Box>
        )}

        {(responseType === 'shortText' || responseType === 'longText') && (
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={responseType === 'shortText' ? 2 : 4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 2 }}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" sx={{ ml: 2 }} onClick={handleSave}>Save</Button>
        </Box>
      </Box>
    )
  );
};

const PerformanceEvaluationForm = () => {
  const navigate = useNavigate();
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [saveEvaluationOpen, setSaveEvaluationOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const handleAddSection = () => setAddSectionOpen(true);
  const handleAddCategory = () => setAddCategoryOpen(true);
  const handleSaveEvaluation = () => setSaveEvaluationOpen(true);
  const handleSettings = () => alert('Settings clicked!');
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleSaveSubCategory = (subCategory) => {
    if (editingSubCategory) {
      setSubCategories(subCategories.map(sc => sc.id === editingSubCategory.id ? { ...sc, ...subCategory } : sc));
    } else {
      setSubCategories([...subCategories, { id: Date.now(), ...subCategory }]);
    }
    setEditingSubCategory(null);
  };

  return (
    <Layout title="Performance Evaluation Form">
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={2} sx={{ borderRadius: '16px', width: '100%', maxWidth: '900px', p: 4, position: 'relative' }}>
          <IconButton sx={{ position: 'absolute', top: 24, right: 24 }} onClick={handleSettings}>
            <SettingsIcon sx={{ color: '#bdbdbd', fontSize: 32 }} />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">Sample Form</Typography>
          <Typography variant="body2" color="text.secondary">Created by: User Name</Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>Date Created: May 16, 2025 - 11:21 AM</Typography>
          <Box sx={{ gap: 2 }}>
            <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', mb: 2, marginLeft: 2, marginRight: 2, mt: 2 }} onClick={handleAddSection}>
                ADD SECTION
            </Button>
            <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', mb: 2, marginLeft: 2, marginRight: 2, mt: 2}} onClick={handleAddCategory}>
                ADD CATEGORY
            </Button>
            <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', mb: 2, marginLeft: 2, marginRight: 2, mt: 2 }} onClick={handleSaveEvaluation}>
                SAVE EVALUATION
            </Button>
            <Button variant="contained" sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', mb: 2, marginLeft: 2, marginRight: 2, mt: 2 }} color="success" onClick={handleOpenModal}>
                Add Sub-Category
            </Button>
            </Box>
          {subCategories.map((subCategory) => (
            <Box key={subCategory.id} sx={{ mt: 3, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
              <Typography variant="h6">{subCategory.subCategoryName}</Typography>
              <Typography variant="body2">Type: {subCategory.responseType}</Typography>
              {subCategory.responseType === 'linearScale' && (
                <>
                  <Typography>{subCategory.label1}</Typography>
                  <Grid container spacing={1} justifyContent="center">
                    {[...Array(subCategory.maxValue - subCategory.minValue + 1)].map((_, idx) => (
                      <Grid item key={idx}><FormControlLabel control={<Radio />} label={subCategory.minValue + idx} /></Grid>
                    ))}
                  </Grid>
                  <Typography>{subCategory.label2}</Typography>
                </>
              )}
              {subCategory.responseType === 'multipleChoice' && (
                <RadioGroup>
                  {subCategory.options.map((opt, i) => (
                    <FormControlLabel key={i} value={opt} control={<Radio />} label={opt} />
                  ))}
                </RadioGroup>
              )}
              {subCategory.responseType === 'checkbox' && (
                subCategory.options.map((opt, i) => (
                  <FormControlLabel key={i} control={<Checkbox />} label={opt} />
                ))
              )}
              {(subCategory.responseType === 'shortText' || subCategory.responseType === 'longText') && (
                <TextField fullWidth label="Response" variant="outlined" rows={subCategory.responseType === 'shortText' ? 2 : 4} multiline />
              )}
            </Box>
          ))}
        </Paper>
      </Box>

      <PerformanceEvaluationFormAddSection open={addSectionOpen} onClose={() => setAddSectionOpen(false)} onSave={() => {}} />
      <PerformanceEvaluationFormAddCategory open={addCategoryOpen} onClose={() => setAddCategoryOpen(false)} onSave={() => {}} />
      <PerformanceEvaluationFormSaveEvaluation open={saveEvaluationOpen} onClose={() => setSaveEvaluationOpen(false)} onProceed={() => setSaveEvaluationOpen(false)} />
      <SubCategoryModal open={openModal} onClose={handleCloseModal} onSave={handleSaveSubCategory} subCategory={editingSubCategory} />
    </Layout>
  );
};

export default PerformanceEvaluationForm;
