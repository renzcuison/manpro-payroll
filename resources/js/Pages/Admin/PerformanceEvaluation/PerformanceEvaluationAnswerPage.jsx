import { useEffect, useState } from 'react';
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
import PerformanceEvaluationEvaluatorAcknowledge from '../../Admin/PerformanceEvaluation/Modals/PerformanceEvaluationEvaluatorAcknowledge';
import Swal from 'sweetalert2';

const PerformanceEvaluationAnswerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    evaluationResponse, evaluatorId, options, signatureFilePaths, subcategories,
    editEvaluationResponse, setPercentageAnswer, setTextAnswer,
    setOptionAnswer, getMultipleChoiceOptionId,
    editEvaluationEvaluator,
    reloadEvaluationResponse
  } = useEvaluationResponse(id);

  const { deleteEvaluationResponse } = useEvaluationResponse(id);

  const handleDeleteMenuEvalForm = async () => {
    const success = await deleteEvaluationResponse();
    if (success) {
      navigate('/admin/performance-evaluation');
    }
  };

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);

  // Modal state for evaluator signature
  const [openEvaluatorAcknowledge, setOpenEvaluatorAcknowledge] = useState(false);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
    }
  }, [evaluationResponse]);

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

  const handleOptionChange = (optionId) => setOptionAnswer(optionId);
  const handleCheckboxChange = (optionId) => setOptionAnswer(optionId);

  const handleShortAnswerChange = (subcategoryId, value) => setTextAnswer(subcategoryId, value);
  const handleLongAnswerChange = (subcategoryId, value) => setTextAnswer(subcategoryId, value);

  // EVALUATOR COMMENT HANDLING
  const handleEvaluatorCommentInput = (evaluator, value) => {
    evaluator.comment = value;
    reloadEvaluationResponse();
  };

  // Submit Handler - open modal for signature
  const handleSubmit = (event) => {
    event.preventDefault();
    setOpenEvaluatorAcknowledge(true);
  };

  // After signature, actually save everything
  const handleEvaluatorProceed = async (signatureData) => {
    setOpenEvaluatorAcknowledge(false);
    setSubmitting(true);
    try {
      // Save current evaluator comment and signature
      await editEvaluationEvaluator({
        response_id: evaluationResponse.id,
        comment: evaluationResponse
          .evaluators
          .find(({evaluator_id}) => evaluator_id === evaluatorId)
          ?.comment
        ,
        signature_filepath: signatureData
      });
      // Save the rest of the evaluation form
      await editEvaluationResponse();
      Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: "Evaluation and signature saved successfully.",
        timer: 1800,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
      navigate(-1);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Failed to submit evaluation.",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    }
    setSubmitting(false);
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

  const { evaluators, form } = evaluationResponse;
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

  // --- CHECK IF THE CURRENT EVALUATOR HAS ALREADY SIGNED ---
  let currentEvaluator = evaluators.find(ev => ev.evaluator_id === evaluatorId);
  let hasEvaluatorSigned = !!(currentEvaluator && currentEvaluator.signature_filepath);

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
          Evaluator: {responseMeta?.evaluators ? responseMeta.evaluators.map(
            evaluator => getFullName(evaluator)
          ).join(' & ') : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
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
                        border: '1px solid #ddd', 
                        borderRadius: 2, 
                        px: 2,
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
  <Grid container justifyContent="center" spacing={7}>
    {subCategory.options?.map((opt, idx) => (
      <Grid item key={opt.id ?? idx} sx={{ textAlign: "center" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mb: 0.5 }}>
            {opt.label}
          </Typography>
          <Radio
            checked={subCategory.percentage_answer?.value === opt.score}
            onChange={() => handleRadioChange(subCategory.id, opt.score)}
            value={opt.score}
            sx={{ mx: "auto" }}
          />
        </Box>
      </Grid>
    ))}
  </Grid>
  {/* Legend and Description below as before */}
  <Divider sx={{ my: 2 }} />
  <Box sx={{ mb: 1, mt: 1 }}>
    <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.92rem', fontWeight:'bold' }}>
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
                            value={getMultipleChoiceOptionId(subCategory.id) || ''}
                            onChange={e => handleOptionChange(+e.target.value)}
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
                                      Boolean(opt.option_answer && opt.option_answer.action != 'delete')
                                    }
                                    onChange={() => handleCheckboxChange(opt.id)}
                                  />
                                }
                                label={opt.label}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      )}

                                            
                      {(subCategory.subcategory_type === 'multiple_choice' || subCategory.subcategory_type === 'checkbox') && (
                        <>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ mb: 1, mt: 1 }}>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', fontSize: '0.92rem', fontWeight:'bold' }}>
                              Legend:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                              {subCategory.options?.map((opt, index) => (
                                <Typography
                                  key={opt.id}
                                  variant="body2"
                                  sx={{ fontStyle: 'italic', fontSize: '0.8rem' }}
                                >
                                  {opt.label} - {opt.score ?? 1} {index !== subCategory.options.length - 1 && ','}
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
                          
                        </>
                      )}

                    </Box>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          ))}
          {/* --- EVALUATOR COMMENTS SECTION AT THE BOTTOM (no save button per evaluator) --- */}
          <Box sx={{ mt: 6, mb: 2}}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Evaluator Comments:
            </Typography>
            {evaluators.length > 0 ? (
              <Box>
                {evaluators.map((evaluator, index) => (
                <Paper
                  key={evaluator.evaluator_id || index}
                  elevation={2}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fffff',
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
                  <Box
                    sx={{
                      border: "1.5px solid #ccc",
                      borderRadius: "8px",
                      px: 2,
                      pt: 2,
                      pb: 0.5,
                      background: "#fff",
                      minHeight: 100,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <TextField
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        readOnly: evaluator.evaluator_id !== evaluatorId,
                        style: {
                          fontSize: "1rem",
                          fontWeight: 400,
                          color: "#222",
                        }
                      }}
                      label="Evaluator Comment"
                      multiline
                      minRows={3}
                      fullWidth
                      value={evaluator.comment}
                      onChange={e => handleEvaluatorCommentInput(evaluator, e.target.value)}
                      placeholder="Enter your comment here"
                      sx={{
                        pb: 2,
                        '& .MuiInputBase-input': {
                          padding: 0,
                        },
                        '& label': { color: '#999', fontWeight: 400 }
                      }}
                    />
                    {evaluator.updated_at && evaluator.signature_filepath && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#888",
                          fontStyle: "italic",
                          mt: 1,
                          mb: 1,
                          ml: 0.5,
                        }}
                      >
                        Signed - {evaluator.updated_at.slice(0, 10)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">
                <i>No evaluators found.</i>
              </Typography>
            )}
          </Box>
          {/* Hide submit button if evaluator has already signed */}
          {!hasEvaluatorSigned ? (
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
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Typography variant="h6" sx={{ color: 'green', fontWeight: 'bold' }}>
                You have already evaluated this form.
              </Typography>
            </Box>
          )}
        </Box>
        <PerformanceEvaluationEvaluatorAcknowledge
          open={openEvaluatorAcknowledge}
          onClose={() => setOpenEvaluatorAcknowledge(false)}
          onProceed={handleEvaluatorProceed}
        />
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationAnswerPage;