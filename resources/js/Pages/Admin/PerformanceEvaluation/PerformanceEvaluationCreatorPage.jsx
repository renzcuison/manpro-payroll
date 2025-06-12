import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails, Paper,
  Chip, TextField, Grid, FormControlLabel, Radio, IconButton, Menu, MenuItem, Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { getFullName } from '../../../utils/user-utils';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationCreatorAcknowledge from '../../Admin/PerformanceEvaluation/Modals/PerformanceEvaluationCreatorAcknowledge';
import Swal from 'sweetalert2';

const PerformanceEvaluationCreatorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    evaluationResponse,
    editEvaluationCreatorSignature
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  // Modal state for acknowledge
  const [openAcknowledgeModal, setOpenAcknowledgeModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
    }
  }, [evaluationResponse]);

  // Approve/Sign Handler
  async function handleCreatorSignature(signatureData) {
    setSaving(true);
    try {
      await editEvaluationCreatorSignature({
        response_id: evaluationResponse.id,
        creator_signature_filepath: signatureData
      });
      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: "Signature saved successfully.",
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Failed to save signature!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    } finally {
      setSaving(false);
      setOpenAcknowledgeModal(false);
    }
  }

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
    'dropdown': 'Dropdown'
  };

  // Helper to render answers
  const renderAnswer = (subCategory) => {
    switch (subCategory.subcategory_type) {
      case 'linear_scale':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answer:
            </Typography>
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
                              disabled
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
            <Typography variant="body1" sx={{ mt: 1 }}>
              Selected: {typeof subCategory.percentage_answer?.value === 'number'
                ? subCategory.percentage_answer.value
                : <span style={{ color: '#ccc', fontStyle: 'italic' }}>No answer</span>
              }
            </Typography>
          </Box>
        );
      case 'short_answer':
      case 'long_answer':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answer:
            </Typography>
            <Typography variant="body1">
              {subCategory.text_answer?.answer
                ? subCategory.text_answer.answer
                : <span style={{ color: '#ccc', fontStyle: 'italic' }}>No answer</span>
              }
            </Typography>
          </Box>
        );
      case 'multiple_choice':
      case 'checkbox':
      case 'dropdown':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {subCategory.subcategory_type === 'checkbox' ? 'Answers:' : 'Answer:'}
            </Typography>
            {Array.isArray(subCategory.options) && subCategory.options.length > 0 ? (
              subCategory.options.map(option =>
                option.option_answer
                  ? <Chip key={option.id} label={option.label} color="primary" sx={{ mr: 1, mb: 1 }} />
                  : null
              ).filter(Boolean).length > 0
                ? subCategory.options.map(option =>
                  option.option_answer
                    ? <Chip key={option.id} label={option.label} color="primary" sx={{ mr: 1, mb: 1 }} />
                    : null
                )
                : <span style={{ color: '#ccc', fontStyle: 'italic' }}>No answer</span>
            ) : <span style={{ color: '#ccc', fontStyle: 'italic' }}>No options</span>}

            {(subCategory.subcategory_type === 'multiple_choice' ||
              subCategory.subcategory_type === 'checkbox' ||
              subCategory.subcategory_type === 'dropdown') && (
                <Box sx={{ mb: 1, mt: 1 }}>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.92rem', fontWeight: 'bold' }}>
                    Legend:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {subCategory.options?.map((opt, index) => (
                      <Typography
                        key={opt.id}
                        variant="body2"
                        sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}
                      >
                        {opt.label} - {opt.score ?? 1}{index !== subCategory.options.length - 1 && ','}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
          </Box>
        );
      default:
        return (
          <Typography variant="body2" sx={{ color: "#aaa", fontStyle: "italic" }}>
            No display available for this answer type.
          </Typography>
        );
    }
  };

  if (loading) {
    return (
      <Layout title="Performance Evaluation Creator View">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const form = evaluationResponse.form;
  const responseMeta = evaluationResponse;
  const allEvaluators = Array.isArray(responseMeta.evaluators) ? responseMeta.evaluators : [];
  const allCommentors = Array.isArray(responseMeta.commentors) ? responseMeta.commentors : [];

  const getOrderLabel = (idx) => {
    const n = idx + 1;
    if (n === 1) return "First";
    if (n === 2) return "Second";
    if (n === 3) return "Third";
    if (n === 4) return "Fourth";
    if (n === 5) return "Fifth";
    return `${n}th`;
  };

  // Render signature area (if present)
  const renderSignature = () => {
    if (evaluationResponse.creator_signature_filepath) {
      return (
        <Box sx={{ my: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Creator's Signature:
          </Typography>
          <Box sx={{ border: "1px solid #ccc", borderRadius: 2, background: "#fff", p: 2 }}>
            <img
              src={evaluationResponse.creator_signature_filepath}
              alt="Creator Signature"
              style={{ width: 300, height: 80, objectFit: "contain" }}
            />
          </Box>
        </Box>
      );
    }
    return null;
  };

  return (
    <Layout title="Performance Evaluation Creator View">
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
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                setTimeout(() => navigate('/admin/performance-evaluation'), 100);
              }}
            >Exit View</MenuItem>
          </Menu>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {form.name}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Evaluatee: {responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Evaluators: {allEvaluators.map(evaluator => getFullName(evaluator)).join(' & ')}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
        </Typography>

        {/* Evaluation Form Sections */}
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
                    <Typography variant="body2">Description: {subCategory.description}</Typography>
                    {renderAnswer(subCategory)}
                  </Box>
                ))
              )}
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Evaluator Comments */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Evaluator Comments:
          </Typography>
          {allEvaluators.length > 0 ? (
            <Box>
              {allEvaluators.map((evaluator, i) => (
                <Paper
                  key={evaluator.evaluator_id || evaluator.id || i}
                  elevation={2}
                  sx={{
                    width: "100%",
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    boxShadow: 1,
                    bgcolor: '#fcfcfc',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#2a7f2a', mb: 0.5 }}>
                    Evaluator {i + 1}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {getFullName(evaluator)}
                  </Typography>
                  <TextField
                    label="Evaluator Comment"
                    multiline
                    minRows={3}
                    fullWidth
                    value={evaluator.comment || ''}
                    sx={{ mt: 1 }}
                    placeholder="No comment provided"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary"><i>No evaluators found.</i></Typography>
          )}
        </Box>

        {/* Commentor Comments */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Commentor Comments:
          </Typography>
          {allCommentors.length > 0 ? (
            <Box>
              {allCommentors.map((commentor, i) => (
                <Paper
                  key={commentor.commentor_id || commentor.id || i}
                  elevation={2}
                  sx={{
                    width: "100%",
                    p: 3,
                    mb: 3,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    boxShadow: 1,
                    bgcolor: '#fcfcfc',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#9E7600', mb: 0.5 }}>
                    {getOrderLabel(i)} Commentor
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {getFullName(commentor)}
                  </Typography>
                  <TextField
                    label="Commentor Comment"
                    multiline
                    minRows={3}
                    fullWidth
                    value={commentor.comment || ''}
                    sx={{ mt: 1 }}
                    placeholder="No comment provided"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography color="text.secondary"><i>No commentors found.</i></Typography>
          )}
        </Box>

        {/* Approve/Sign Button */}
        {!evaluationResponse.creator_signature_filepath && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={() => setOpenAcknowledgeModal(true)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Approve"}
            </Button>
          </Box>
        )}

        {/* Creator Acknowledge Modal */}
        <PerformanceEvaluationCreatorAcknowledge
          open={openAcknowledgeModal}
          onClose={() => setOpenAcknowledgeModal(false)}
          onProceed={handleCreatorSignature}
        />
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationCreatorPage;