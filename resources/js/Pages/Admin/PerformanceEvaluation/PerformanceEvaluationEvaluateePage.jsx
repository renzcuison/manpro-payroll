import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, Chip, TextField, Grid, Button, Divider
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationEvaluateeAcknowledge from '../../Admin/PerformanceEvaluation/Modals/PerformanceEvaluationEvaluateeAcknowledge';
import Swal from 'sweetalert2';
import ScoreLinearBar from './Test/ScoreLinearBar';



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
    } else if (subcat.subcategory_type === 'checkbox') {
      const selected = subcat.options.filter(opt => opt.option_answer);
      const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      const allSum = subcat.options.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      if (allSum > 0) {
        subScore = (selectedSum / allSum) * 5;
      }
      subcatScores.push({ name: subcat.name, score: subScore });
      scoreTotal += subScore;
      counted++;
    } else if (subcat.subcategory_type === 'linear_scale') {
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



const PerformanceEvaluationEvaluateePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    evaluationResponse,
    editEvaluationCreatorSignature
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [savingAcknowledge, setSavingAcknowledge] = useState(false);

  useEffect(() => {
    if (evaluationResponse && evaluationResponse.form) {
      setLoading(false);
    }
  }, [evaluationResponse]);

  const handleSettingsClick = (event) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);
  const settingsOpen = Boolean(settingsAnchorEl);

  const handleAcknowledge = async (signatureData) => {
    setSavingAcknowledge(true);
    try {
      await editEvaluationCreatorSignature({
        response_id: evaluationResponse.id,
        evaluatee_signature_filepath: signatureData,
      });
      Swal.fire({
        icon: 'success',
        title: 'Acknowledged!',
        text: "Your acknowledgment has been saved.",
        timer: 1600,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
      setAckModalOpen(false);
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "Failed to save your acknowledgment!",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: 'center'
      });
    } finally {
      setSavingAcknowledge(false);
    }
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

  const allCommentors = Array.isArray(responseMeta.commentors) && responseMeta.commentors.length > 0
    ? responseMeta.commentors
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

  const hasAcknowledged = !!responseMeta.evaluatee_signature_filepath;

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

        {/* Sections */}
        {(!form.sections || form.sections.length === 0) && (
          <Typography>No sections available for this form.</Typography>
        )}
        {form.sections && form.sections.map(section => {
          const { sectionScore, subcatScores } = getSectionScore(section);
          const openAnswers = section.subcategories.filter(sc =>
            sc.subcategory_type === 'short_answer' || sc.subcategory_type === 'long_answer'
          );
            const hasScorableSubcats = section.subcategories.some(sc =>
              sc.subcategory_type === 'multiple_choice' ||
              sc.subcategory_type === 'checkbox' ||
              sc.subcategory_type === 'linear_scale'
            );
          return (
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
                    Overall Rating - {section.name}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2 }}>
 {hasScorableSubcats && (
  <>
    {/* SCORES BAR CHART */}
    <Box sx={{ width: '100%', maxWidth:800, mx: "auto", mt: 2, mb: 1 }}>
      {subcatScores.map(({ name, score }, idx) => (
        <Grid container alignItems="center" spacing={2} sx={{ mb: 1 }} key={idx}>
          <Grid item sx={{ minWidth: 130, flexGrow: 0 }}>
            <Typography sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              {name}
            </Typography>
          </Grid>
          <Grid item xs zeroMinWidth sx={{ pr: 2 }}>
            <ScoreLinearBar
              variant="determinate"
              value={(score / 5) * 100}
              sx={{ width: '100%', minWidth: 580 }}
            />
          </Grid>
          <Grid item sx={{ minWidth: 40, textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 'bold', ml: 1 }}>{score.toFixed(1)}</Typography>
          </Grid>
        </Grid>
      ))}
    </Box>

    <Divider sx={{ my: 2 }} />

    {/* Section Total */}
    <Box sx={{ width: '100%', maxWidth:800, mx: "auto", mt: 2, mb: 1 }}>
      <Grid container alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <Grid item sx={{ minWidth: 130, flexGrow: 0 }}>
          <Typography sx={{ fontWeight: 700, color: "#262626" }}>Total Rating</Typography>
        </Grid>
        <Grid item xs zeroMinWidth sx={{ pr: 2 }}>
          <ScoreLinearBar
            variant="determinate"
            value={(sectionScore / 5) * 100}
            sx={{ width: '100%', minWidth: 590 }}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography sx={{ fontWeight: 700, ml: 1 }}>{sectionScore.toFixed(1)}</Typography>
        </Grid>
      </Grid>
    </Box>
  </>
)}
                {/* SHORT/LONG ANSWERS */}
                
                {openAnswers.length > 0 && (
                  <Box sx={{ width: '100%', maxWidth:800, mx: "auto", mt: 3, mb: 1 }}>
                    {openAnswers.map(subcat => (
                    <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Open-ended Answers: {subcat.name}</Typography>
                    ))}
                    {openAnswers.map(subcat => (
                      <Box key={subcat.id} sx={{ mb: 2 }}>
                        {/* <Typography sx={{ fontWeight: 500 }}>{subcat.name}</Typography> */}
                        <Typography variant="body2" sx={{ color: '#444', flex: 1, mt: 1 }}>
                          {subcat.text_answer?.answer ||
                            <span style={{ color: "#bbb", fontStyle: "italic" }}>No answer</span>}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* All Commentors Section - Each in its own box, stacked vertically */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Commentors:
          </Typography>
          {allCommentors.length > 0 ? (
            <Box>
              {allCommentors.map((commentor, i) => (
                <Paper
                  key={commentor.commentor_id}
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
                    label="Comment"
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

        {/* ACKNOWLEDGMENT SECTION */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        {hasAcknowledged ? (
          <Box>
            <Typography sx={{ color: '#137333', fontWeight: 'bold', mb: 2 }}>
              You have acknowledged this evaluation.
            </Typography>
            {/* Signature preview removed as requested */}
          </Box>
        ) : (
          <Button
            variant="contained"
            color="primary"
            sx={{
              mt: 2,
              px: 5,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: 18,
              borderRadius: 2
            }}
            onClick={() => setAckModalOpen(true)}
            disabled={savingAcknowledge}
          >
            {savingAcknowledge ? "Saving..." : "Acknowledge"}
          </Button>
        )}
      </Box>
        <PerformanceEvaluationEvaluateeAcknowledge
          open={ackModalOpen}
          onClose={() => setAckModalOpen(false)}
          onProceed={handleAcknowledge}
        />
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationEvaluateePage;