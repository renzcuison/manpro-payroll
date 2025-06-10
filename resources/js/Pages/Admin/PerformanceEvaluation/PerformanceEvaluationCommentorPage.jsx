import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, Chip, Button, TextField
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationFormSaveEvaluation from './Modals/PerformanceEvaluationFormSaveEvaluation';

const PerformanceEvaluationCommentorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    evaluationResponse,
    saveEvaluationResponse,
    editEvaluationCommentor // <-- you should implement this in your hook to update the comment on backend
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveEvaluationOpen, setSaveEvaluationOpen] = useState(false);
  const [firstCommentorComment, setFirstCommentorComment] = useState('');
  const [firstCommentorId, setFirstCommentorId] = useState(null);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
      // Set initial value for first commentor
      if (
        Array.isArray(evaluationResponse.commentors) &&
        evaluationResponse.commentors.length > 0
      ) {
        setFirstCommentorComment(evaluationResponse.commentors[0].comment || '');
        setFirstCommentorId(evaluationResponse.commentors[0].commentor_id);
      }
    }
  }, [evaluationResponse]);

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };
  const settingsOpen = Boolean(settingsAnchorEl);

  const handleSaveEvaluation = async () => {
    setSaving(true);
    // Optionally save the comment before saving evaluation
    if (firstCommentorId && firstCommentorComment !== undefined && editEvaluationCommentor) {
      await editEvaluationCommentor({
        response_id: evaluationResponse.id,
        commentor_id: firstCommentorId,
        comment: firstCommentorComment
      });
    }
    await saveEvaluationResponse();
    setSaving(false);
    setSaveEvaluationOpen(false);
    alert('Evaluation saved!');
  };

  const responseTypeMap = {
    'linear_scale': 'Linear Scale',
    'multiple_choice': 'Multiple Choice',
    'checkbox': 'Checkbox',
    'short_answer': 'Short Answer',
    'long_answer': 'Long Answer',
    'dropdown': 'Dropdown'
  };

  if (loading) {
    return (
      <Layout title="Performance Evaluation Answers">
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
      <Layout title="Performance Evaluation Answers">
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
        </Box>
      </Layout>
    );
  }

  // Helper to display answers for various types
  const renderAnswer = (subCategory) => {
    switch (subCategory.subcategory_type) {
      case 'linear_scale':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answer:
            </Typography>
            <Typography variant="body1">
              {typeof subCategory.percentage_answer?.value === 'number'
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
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answer:
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
          </Box>
        );
      case 'checkbox':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answers:
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
          </Box>
        );
      case 'dropdown':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Answer:
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

  // Find first commentor (if any)
  const firstCommentor = Array.isArray(responseMeta.commentors) && responseMeta.commentors.length > 0
    ? responseMeta.commentors[0]
    : null;

  return (
    <Layout title="Performance Evaluation Answers">
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
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                setTimeout(() => navigate('/admin/performance-evaluation'), 100);
              }}
            >Exit Form</MenuItem>
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

        {/* First Commenter Section with Editable TextField */}
        <Box sx={{
          mt: 6,
          p: 3,
          bgcolor: '#f8f8f8',
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            First Commenter:
          </Typography>
          {firstCommentor ? (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {getFullName(firstCommentor)}
              </Typography>
              <TextField
                label="Comment"
                multiline
                minRows={3}
                fullWidth
                value={firstCommentorComment}
                sx={{ mt: 1 }}
                onChange={e => setFirstCommentorComment(e.target.value)}
                placeholder="Enter your comment here"
              />
            </Box>
          ) : (
            <Typography color="text.secondary"><i>No first commenter found.</i></Typography>
          )}
        </Box>

        {/* Save Evaluation Button and Modal */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            sx={{ bgcolor: '#137333', color: '#fff', fontWeight: 'bold', px: 4, py: 1.5 }}
            onClick={() => setSaveEvaluationOpen(true)}
            disabled={saving}
          >
            SAVE EVALUATION
          </Button>
        </Box>
        <PerformanceEvaluationFormSaveEvaluation
          open={saveEvaluationOpen}
          onClose={() => setSaveEvaluationOpen(false)}
          onProceed={handleSaveEvaluation}
        />
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationCommentorPage;