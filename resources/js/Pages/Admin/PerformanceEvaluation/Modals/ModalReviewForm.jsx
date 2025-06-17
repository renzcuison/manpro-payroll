import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogTitle, IconButton, Box, Typography, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Menu, MenuItem, Paper, Chip, TextField, Grid,
  FormControlLabel, Radio, Button, Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getFullName } from '../../../../utils/user-utils';
import { useEvaluationResponse } from '../../../../hooks/useEvaluationResponse';
import PerformanceEvaluationCommentorAcknowledge from '../../../Admin/PerformanceEvaluation/Modals/PerformanceEvalutionCommentorAcknowledge';
import Swal from 'sweetalert2';

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

const responseTypeMap = {
  'linear_scale': 'Linear Scale',
  'multiple_choice': 'Multiple Choice',
  'checkbox': 'Checkbox',
  'short_answer': 'Short Answer',
  'long_answer': 'Long Answer',
  'dropdown': 'Dropdown'
};

const ModalReviewForm = ({ open, onClose, id }) => {
  const {
    evaluationResponse,
    editEvaluationCommentor
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [commentorComments, setCommentorComments] = useState([]);
  const [savingIds, setSavingIds] = useState([]);
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

  const handleCommentInput = (commentor_id, value) => {
    setCommentorComments(prev =>
      prev.map(c =>
        c.commentor_id === commentor_id ? { ...c, comment: value } : c
      )
    );
  };

  const handleOpenAcknowledgeModal = (commentor_id) => {
    setOpenAcknowledgeFor(commentor_id);
  };

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

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Review Results</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const form = evaluationResponse.form;
  const responseMeta = evaluationResponse;

  if (!form || !responseMeta) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Review Results</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="h6" color="error">Evaluation Form or Response Not Found</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

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

  // Use your renderAnswer function as before (copy from your original)
  const renderAnswer = (subCategory) => {
    // ...copy your renderAnswer code here...
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
                <Divider sx={{ my: 2 }} />
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.92rem', fontWeight:'bold' }}>
                      Description:
                    </Typography>
                    <Box>
                      {subCategory.options?.map((opt, index) =>
                          opt.description ? (
                            <Typography
                              key={opt.id + "_desc"}
                              variant="body2"
                              sx={{fontSize: '0.8rem'}}
                            >
                              {opt.score} - {opt.description}
                            </Typography>
                          ) : null
                        )}
                    </Box>
                    

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        Review Results
        <IconButton onClick={onClose} sx={{ ml: 2 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, minHeight: 400 }}>
        <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
          {form.name}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Evaluatee: {responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
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
                  {/* <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenAcknowledgeModal(commentor.commentor_id)}
                      disabled={savingIds.includes(commentor.commentor_id)}
                    >
                      {savingIds.includes(commentor.commentor_id) ? "Saving..." : "Save Comment"}
                    </Button>
                  </Box> */}
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
      </DialogContent>
    </Dialog>
  );
};

export default ModalReviewForm;