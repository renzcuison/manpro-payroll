import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Divider, Grid,
  FormControlLabel, Radio, RadioGroup, Checkbox, TextField, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Menu, MenuItem, Paper, FormGroup
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';

const PerformanceEvaluationAnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { deleteEvaluationResponse } = useEvaluationResponse(id);

  const handleDeleteMenuEvalForm = async () => {
    const success = await deleteEvaluationResponse();
    if (success) {
      // Redirect away after delete, e.g. to the evaluation list
      navigate('/admin/performance-evaluation');
    }
  };

  const {
    evaluationResponse, options, subcategories,
    saveEvaluationResponse, setPercentageAnswer, setTextAnswer,
    deleteOptionAnswer, deleteOptionAnswers, setOptionAnswer
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
    }
  }, [evaluationResponse]);

  // Handlers for Settings menu
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  const settingsOpen = Boolean(settingsAnchorEl);

  const responseTypeMap = {
    'linear_scale': 'Linear Scale',
    'multiple_choice': 'Multiple Choice',
    'checkbox': 'Checkbox',
    'short_answer': 'Short Answer',
    'long_answer': 'Long Answer',
  };

  // Handler for linear scale
  const handleRadioChange = (subcategoryId, value) => {
    setPercentageAnswer(subcategoryId, value);
  };

  // Handler for single select (multiple_choice)
  const handleOptionChange = (subcategoryId, optionId) => {
    setOptionAnswer(subcategoryId, optionId);
  };

  // Handler for checkbox (multi-select)
  const handleCheckboxChange = (subcategoryId, optionId) => (event) => {
    setCheckboxAnswers(subcategoryId, optionId, event.target.checked);
  };

  const handleShortAnswerChange = (subcategoryId, value) => {
    setTextAnswer(subcategoryId, value);
  };
  const handleLongAnswerChange = (subcategoryId, value) => {
    setTextAnswer(subcategoryId, value);
  };

  // Submit Handler
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    await saveEvaluationResponse();
    setSubmitting(false);
    alert("Evaluation response saved successfully.");
    navigate(-1);
  };

  if (loading) {
    return (
      <Layout title="Performance Evaluation Form">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const form = evaluationResponse.form;
  const responseMeta = evaluationResponse;

  if (!form || !responseMeta) {
    return (
      <Layout title="Performance Evaluation Form">
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Performance Evaluation Form">
      <Box
        sx={{
          mt: 5,
          p: 5,
          bgcolor: 'white',
          borderRadius: '8px',
          maxWidth: '1000px',
          mx: 'auto',
          boxShadow: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
          {/* Settings Icon with Dropdown Menu */}
          <IconButton
            onClick={handleSettingsClick}
            sx={{
              position: 'absolute',
              top: 5,
              right: 10,
              color: '#bdbdbd',
              borderRadius: '50%',
              padding: '5px',
              color: '#BEBEBE',
            }}
            aria-controls={settingsOpen ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={settingsOpen ? 'true' : undefined}
          >
            <SettingsIcon sx={{ fontSize: 28 }} />
          </IconButton>
          <Menu
            id="settings-menu"
            anchorEl={settingsAnchorEl}
            open={settingsOpen}
            onClose={handleSettingsClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={handleDeleteMenuEvalForm}>Delete Evaluation</MenuItem>
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                setTimeout(() => navigate('/admin/performance-evaluation'), 100);
              }}
            >Exit Evaluation</MenuItem>
          </Menu>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {form.name}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Evaluatee: {responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Evaluators: {responseMeta?.evaluators ? responseMeta.evaluators.map(
            evaluator => getFullName(evaluator)
          ).join(' & ') : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
        </Typography>

        <Box component="form" onSubmit={e => handleSubmit(e)}>
          {(!form.sections || form.sections.length === 0) && (
            <Typography>No sections available for this form.</Typography>
          )}
          {form.sections && form.sections.map(section => (
            <Accordion
              key={section.id}
              expanded
              disableGutters
              elevation={0}
              sx={{
                bgcolor: '#ffff',
                borderRadius: '8px',
                boxShadow: 3,
                mb: 2,
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary
                sx={{
                  bgcolor: '#E9AE20',
                  borderBottom: '1px solid #ffe082',
                  cursor: 'default',
                  minHeight: 0,
                  mt: 3,
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  '& .MuiAccordionSummary-content': {
                    margin: 0,
                    alignItems: "center"
                  }
                }}
              >
                <Box sx={{ my: 2 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', color: "white" }}>
                    {section.name}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2 }}>
                {section.category ? (
                  <Paper
                    elevation={2}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      bgcolor: '#f3f3f3',
                      borderRadius: 2,
                      borderLeft: '8px solid #eab31a',
                      px: 2,
                      pt: 2,
                      pb: 2,
                      mt: 2,
                      mb: 2,
                      mx: 2,
                      boxShadow: 2
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        color: '#222'
                      }}
                    >
                      {section.category}
                    </Typography>
                  </Paper>
                ) : (
                  <Box sx={{ textAlign: "center", mt: 3, color: "#aaa", fontStyle: "italic", mb: 2 }}>
                    No category in this section.
                  </Box>
                )}
                {(section.subcategories || []).length === 0 ? (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>No subcategories in this section.</Typography>
                ) : (
                  section.subcategories.map((subCategory) => (
                    <Box
                      key={subCategory.id}
                      sx={{
                        mb: 3, border: '1px solid #ddd', borderRadius: 2, px: 2,
                        pt: 2,
                        pb: 2,
                        mt: 2,
                        mb: 2,
                        mx: 2,
                        bgcolor: '#f3f3f3',
                        boxShadow: 2
                      }}
                    >
                      <Typography variant="h6" color="black" sx={{ mb: 0.5 }}>
                        {subCategory.name}
                      </Typography>
                      <Typography variant="body2">Type: {responseTypeMap[subCategory.subcategory_type] || 'Unknown'}</Typography>
                      <Typography variant="body2" >Description: {subCategory.description}</Typography>

                      {subCategory.subcategory_type === 'linear_scale' && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container alignItems="center" spacing={2} justifyContent='center'>
                            <Grid item>
                              <Typography variant="body1">{subCategory.linear_scale_start_label}</Typography>
                            </Grid>
                            <Grid item xs>
                              <Grid container justifyContent="center" spacing={1}>
                                {[...Array(subCategory.linear_scale_end - subCategory.linear_scale_start + 1)].map((_, index) => {
                                  const value = subCategory.linear_scale_start + index;
                                  return (
                                    <Grid item key={value}>
                                      <FormControlLabel
                                        control={
                                          <Radio
                                            checked={subCategory.percentage_answer?.value === value}
                                            onChange={() => handleRadioChange(subCategory.id, value)}
                                            value={value}
                                          />
                                        }
                                        label={value}
                                        labelPlacement="top"
                                      />
                                    </Grid>
                                  );
                                })}
                              </Grid>
                            </Grid>
                            <Grid item>
                              <Typography variant="body1">{subCategory.linear_scale_end_label}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'short_answer' && (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Short Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={2}
                            value={subCategory.text_answer?.answer || ''}
                            onChange={(e) => handleShortAnswerChange(subCategory.id, e.target.value)}
                          />
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'long_answer' && (
                        <Box sx={{ mb: 2 }}>
                          <TextField
                            label="Long Text"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={4}
                            value={subCategory.text_answer?.answer || ''}
                            onChange={(e) => handleLongAnswerChange(subCategory.id, e.target.value)}
                          />
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'multiple_choice' && (
                        <Box sx={{ mb: 2 }}>
                          <RadioGroup
                            value={subCategory.option_answer?.option_id || ''}
                            onChange={e => handleOptionChange(subCategory.id, parseInt(e.target.value))}
                          >
                            {(subCategory.options || []).map(opt => (
                              <FormControlLabel
                                key={opt.id}
                                value={opt.id}
                                control={<Radio />}
                                label={opt.label}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      )}

                      {subCategory.subcategory_type === 'checkbox' && (
                        <Box sx={{ mb: 2 }}>
                          <FormGroup>
                            {(subCategory.options || []).map(opt => (
                              <FormControlLabel
                                key={opt.id}
                                control={
                                  <Checkbox
                                    checked={
                                      (subCategory.checkbox_answers || []).includes(opt.id)
                                    }
                                    onChange={handleCheckboxChange(subCategory.id, opt.id)}
                                  />
                                }
                                label={opt.label}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      )}

                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !form}
              sx={{ mt: 2, px: 4, py: 1.5, fontWeight: 'bold', bgcolor: '#177604', '&:hover': { bgcolor: '#0d5c27' } }}
            >
              {submitting ? "Submitting..." : "Submit Evaluation"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationAnswerPage; 