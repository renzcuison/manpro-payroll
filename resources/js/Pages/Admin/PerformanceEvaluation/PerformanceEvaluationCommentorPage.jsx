import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, Chip, TextField, Grid, FormControlLabel, Radio, Button, Divider
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationCommentorAcknowledge from '../../Admin/PerformanceEvaluation/Modals/PerformanceEvalutionCommentorAcknowledge';
import Swal from 'sweetalert2';


// --- Overall Rating Calculation Helper ---
const getSectionScore = (section) => {
  if (!section || !section.subcategories) return { sectionScore: 0, subcatScores: [] };
  let scoreTotal = 0;
  let counted = 0;
  const subcatScores = [];

  section.subcategories.forEach(subcat => {
    let subScore = 0;
    if (subcat.subcategory_type === 'multiple_choice') {
      const selected = subcat.options.find(opt => opt.option_answer);
      if (selected) {
        const highestScore = Math.max(...subcat.options.map(o => Number(o.score) || 1));
        if (highestScore > 0) {
          subScore = ((Number(selected.score) || 1) / highestScore) * 5;
        }
      }
      subcatScores.push({ name: subcat.name, score: subScore });
      scoreTotal += subScore;
      counted++;
    }
    else if (subcat.subcategory_type === 'checkbox') {
      const selected = subcat.options.filter(opt => opt.option_answer);
      const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      const allSum = subcat.options.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      if (allSum > 0) {
        subScore = (selectedSum / allSum) * 5;
      }
      subcatScores.push({ name: subcat.name, score: subScore });
      scoreTotal += subScore;
      counted++;
    }
    else if (subcat.subcategory_type === 'linear_scale') {
      if (subcat.percentage_answer && typeof subcat.percentage_answer.value === 'number') {
        const start = Number(subcat.linear_scale_start) || 1;
        const end = Number(subcat.linear_scale_end) || 5;
        const value = Number(subcat.percentage_answer.value);
        if (end > start) {
          subScore = ((value - start) / (end - start)) * 5;
        }
      }
      subcatScores.push({ name: subcat.name, score: subScore });
      scoreTotal += subScore;
      counted++;
    }
  });

  const sectionScore = counted > 0 ? scoreTotal / counted : 0;
  return { sectionScore, subcatScores };
};

// --- Score Linear Bar ---
const Bar = ({ value, max = 100, sx = {} }) => {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  return (
    <Box
      sx={{
        width: '100%',
        height: 18,
        borderRadius: '9px',
        background: '#e0e0e0',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0px 1px 2px #e0e0e0',
        ...sx,
      }}
    >
      <Box
        sx={{
          width: `${pct}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #367C2B 0%, #EAB31A 100%)',
          borderRadius: '9px', // Make both ends rounded
          position: 'absolute',
          top: 0,
          left: 0,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </Box>
  );
};
// --- END Overall Rating Helper ---

const PerformanceEvaluationCommentorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    evaluationResponse,
    editEvaluationCommentor
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [commentorComments, setCommentorComments] = useState([]);
  const [savingIds, setSavingIds] = useState([]);

  // Modal state per commentor
  const [openAcknowledgeFor, setOpenAcknowledgeFor] = useState(null);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
      if (Array.isArray(evaluationResponse.commentors) && evaluationResponse.commentors.length > 0) {
        setCommentorComments(
          evaluationResponse.commentors.map(c => ({
            commentor_id: c.commentor_id,
            comment: c.comment || '',
            name: getFullName(c)
          }))
        );
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

  const handleCommentInput = (commentor_id, value) => {
    setCommentorComments(prev =>
      prev.map(c =>
        c.commentor_id === commentor_id ? { ...c, comment: value } : c
      )
    );
  };

  // Show modal first, then save after signature
  const handleOpenAcknowledgeModal = (commentor_id) => {
    setOpenAcknowledgeFor(commentor_id);
  };

  // Called after signature is done in modal
  const handleProceedAcknowledge = async (signatureData, commentor_id) => {
    setSavingIds(prev => [...prev, commentor_id]);
    const commentObj = commentorComments.find(c => c.commentor_id === commentor_id);
    try {
      await editEvaluationCommentor({
        response_id: evaluationResponse.id,
        commentor_id,
        comment: commentObj ? commentObj.comment : "",
        signature_filepath: signatureData // PNG dataURL
      });
      Swal.fire({
        icon: 'success',
        title: 'Saved!',
        text: "Comment & signature saved successfully.",
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Failed to save comment and signature!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    } finally {
      setSavingIds(prev => prev.filter(id => id !== commentor_id));
      setOpenAcknowledgeFor(null); // Close modal after try/catch
    }
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

  // --- Overall Rating Section: only code added below ---
  const overallRatingSections = (form.sections || []).filter(section =>
    section.subcategories?.some(
      subcat => ['multiple_choice', 'checkbox', 'linear_scale'].includes(subcat.subcategory_type)
    )
  );
  // --- End Overall Rating Section code ---

  // Render answer with legend
  const renderAnswer = (subCategory) => {
    switch (subCategory.subcategory_type) {
      case 'linear_scale':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
            {/* <Typography variant="body1" sx={{ mt: 1 }}>
              {typeof subCategory.percentage_answer?.value === 'number'
                ? subCategory.percentage_answer.value
                : <span style={{ color: '#ccc', fontStyle: 'italic' }}>No answer</span>
              }
            </Typography> */}
          </Box>
        );
      case 'short_answer':
      case 'long_answer':
        return (
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
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
        const selectedOptions = Array.isArray(subCategory.options)
          ? subCategory.options.filter(opt => opt.option_answer)
          : [];
        const hasSelected = selectedOptions.length > 0;
        return (
         <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {subCategory.subcategory_type === 'checkbox' ? 'Answers:' : 'Answer:'}
            </Typography>
            {Array.isArray(subCategory.options) && subCategory.options.length > 0 ? (
              hasSelected ? (
                <Typography variant="body2" sx={{fontWeight: 500 }}>
                  {selectedOptions.map(opt => opt.label).join(', ')}   
                </Typography>
              ) : (
                <span style={{ color: '#ccc', fontStyle: 'italic' }}>No answer</span>
              )
            ) : (
              <span style={{ color: '#ccc', fontStyle: 'italic' }}>No options</span>
            )}

             <Divider sx={{ my: 2 }} />

            {/* Legend for multiple_choice, checkbox, dropdown */}
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

  const allCommentors = Array.isArray(responseMeta.commentors) && responseMeta.commentors.length > 0
    ? responseMeta.commentors
    : [];

  const allEvaluators = Array.isArray(responseMeta.evaluators) && responseMeta.evaluators.length > 0
    ? responseMeta.evaluators
    : [];

  const getOrderLabel = (idx) => {
    const n = idx + 1;
    if (n === 1) return "First";
    if (n === 2) return "Second";
    if (n === 3) return "Third";
    if (n === 4) return "Fourth";
    if (n === 5) return "Fifth";
    return `${n}th`;
  };

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
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    borderLeft: '8px solid #eab31a',
                    px: 2,
                    pt: 2,
                    pb: 2,
                    mt: 2,
                    mb: 2,
                    width: '100%',
                    boxShadow: 2,
                  }}
                >
                  
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
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

       <Box sx={{ mt: 6 }}>
  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
    Comments:
  </Typography>
  {allCommentors.length > 0 ? (
    <Box>
      {allCommentors.map((commentor, i) => (
        <Paper
          key={commentor.commentor_id}
          elevation={2}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            bgcolor: '#fff',
            borderRadius: 2,
            borderLeft: '8px solid #eab31a',
            px: 2,
            pt: 2,
            pb: 2,
            mt: 2,
            mb: 2,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E9AE20', mb: 0.5 }}>
            {commentor.client_id}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
            {getFullName(commentor)}
          </Typography>
          <TextField
            label="Comment"
            multiline
            minRows={3}
            fullWidth
            value={
              commentorComments.find(c => c.commentor_id === commentor.commentor_id)?.comment || ''
            }
            sx={{ mt: 1 }}
            onChange={e => handleCommentInput(commentor.commentor_id, e.target.value)}
            placeholder="Enter your comment here"
            disabled={savingIds.includes(commentor.commentor_id)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleOpenAcknowledgeModal(commentor.commentor_id)}
              disabled={savingIds.includes(commentor.commentor_id)}
            >
              {savingIds.includes(commentor.commentor_id) ? "Saving..." : "Save Comment"}
            </Button>
          </Box>
          {/* Modal for this commentor */}
          <PerformanceEvaluationCommentorAcknowledge
            open={openAcknowledgeFor === commentor.commentor_id}
            onClose={() => setOpenAcknowledgeFor(null)}
            onProceed={signatureData => handleProceedAcknowledge(signatureData, commentor.commentor_id)}
          />
        </Paper>
      ))}
    </Box>
  ) : (
    <Typography color="text.secondary"><i>No commentors found.</i></Typography>
  )}
</Box>
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationCommentorPage;