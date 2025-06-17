import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, TextField, Grid, Button, Divider
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationEvaluateeAcknowledge from '../../Admin/PerformanceEvaluation/Modals/PerformanceEvaluationEvaluateeAcknowledge';
import Swal from 'sweetalert2';
import ScoreLinearBar from './Test/ScoreLinearBar';
import jsPDF from "jspdf";

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
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    } else if (subcat.subcategory_type === 'checkbox') {
      const selected = subcat.options.filter(opt => opt.option_answer);
      const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      const allSum = subcat.options.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      if (allSum > 0) {
        subScore = (selectedSum / allSum) * 5;
      }
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
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
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    }
  });

  const sectionScore = counted > 0 ? scoreTotal / counted : 0;
  return { sectionScore, subcatScores };
};

async function loadImageAsBase64(url) {
  if (url && url.startsWith('data:image/')) {
    return Promise.resolve(url);
  }
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

const PerformanceEvaluationEvaluateePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    evaluationResponse, evaluateeSignatureFilePath,
    editEvaluationSignature
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [savingAcknowledge, setSavingAcknowledge] = useState(false);
  const [hoveredSubcat, setHoveredSubcat] = useState(null);
  const [hoveredOpenAnswer, setHoveredOpenAnswer] = useState(null);

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
      await editEvaluationSignature({
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

  const handleDownloadPDF = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 40;
    let y = margin;

    const form = evaluationResponse.form;
    const responseMeta = evaluationResponse;

    // Title
    doc.setFontSize(22);
    doc.text(form.name, margin, y);
    y += 30;

    // Evaluatee & Evaluators
    doc.setFontSize(12);
    doc.text(`Evaluatee: ${responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}`, margin, y);
    y += 18;
    doc.text(
      `Evaluators: ${responseMeta?.evaluators ? responseMeta.evaluators.map(getFullName).join(', ') : ''}`,
      margin, y
    );
    y += 18;
    doc.text(`Period: ${responseMeta.period_start_date} to ${responseMeta.period_end_date}`, margin, y);
    y += 24;

    // Sections and Scores
    form.sections.forEach(section => {
      const { sectionScore, subcatScores } = getSectionScore(section);
      doc.setFontSize(15);
      doc.text(`Section: ${section.name}`, margin, y);
      y += 18;

      subcatScores.forEach(({ name, score, description }) => {
        doc.setFontSize(12);
        doc.text(` - ${name}: ${score.toFixed(1)}`, margin + 10, y);
        y += 16;
        if (description) {
          doc.setFontSize(10);
          doc.text(`   Description: ${description}`, margin + 18, y);
          y += 14;
        }
      });

      doc.setFontSize(12);
      doc.text(`Total Rating: ${sectionScore.toFixed(1)}`, margin + 10, y);
      y += 20;
    });

    // Comments
    const allCommentors = Array.isArray(responseMeta.commentors) && responseMeta.commentors.length > 0
      ? responseMeta.commentors
      : [];
    if (allCommentors.length > 0) {
      doc.setFontSize(13);
      doc.text("Comments:", margin, y);
      y += 18;
      allCommentors.forEach((commentor, idx) => {
        doc.setFontSize(12);
        doc.text(`${getOrderLabel(idx)} Commentor: ${getFullName(commentor)}`, margin + 10, y);
        y += 16;
        doc.text(commentor.comment || "(No comment provided)", margin + 18, y);
        y += 20;
      });
    }

    // Signatures
    y += 16;
    doc.setFontSize(14);
    doc.text("Signatures:", margin, y);
    y += 18;

async function addSignatureImage(url, label, y) {
  if (!url || url === "data:image/png;base64,") return y;
  try {
    // Try to "sanitize" the image by drawing it on a canvas and re-exporting as PNG
    const img = new window.Image();
    img.src = url;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pngDataUrl = canvas.toDataURL('image/png');

    doc.setFontSize(12);
    doc.text(label, margin + 10, y + 15);
    doc.addImage(pngDataUrl, "PNG", margin + 120, y, 80, 40);
    y += 50;
  } catch (err) {
    console.error("Error rendering signature", label, err, url);
    doc.text(`${label} (signature not found)`, margin + 10, y + 15);
    y += 20;
  }
  return y;
}

    if (responseMeta.creator_signature_filepath) {
      y = await addSignatureImage(responseMeta.creator_signature_filepath, "Creator Signature", y);
    }
    if (evaluateeSignatureFilePath) {
      y = await addSignatureImage(evaluateeSignatureFilePath, "Evaluatee Signature", y);
    }
    if (Array.isArray(responseMeta.evaluators)) {
      for (const evaluator of responseMeta.evaluators) {
        if (evaluator.signature_filepath) {
          y = await addSignatureImage(evaluator.signature_filepath, `${getFullName(evaluator)} (Evaluator)`, y);
        }
      }
    }
    if (Array.isArray(responseMeta.commentors)) {
      for (const commentor of responseMeta.commentors) {
        if (commentor.signature_filepath) {
          y = await addSignatureImage(commentor.signature_filepath, `${getFullName(commentor)} (Commentor)`, y);
        }
      }
    }

    doc.save(`evaluation_${form.name.replace(/\s+/g, '_')}.pdf`);
  };

  const getOrderLabel = (idx) => {
    const n = idx + 1;
    if (n === 1) return "First";
    if (n === 2) return "Second";
    if (n === 3) return "Third";
    if (n === 4) return "Fourth";
    if (n === 5) return "Fifth";
    return `${n}th`;
  };

  const form = evaluationResponse.form;
  const responseMeta = evaluationResponse;

  if (loading) {
    return (
      <Layout title="Performance Evaluation Answers">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

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

  const allEvaluators = Array.isArray(responseMeta.evaluators) && responseMeta.evaluators.length > 0
    ? responseMeta.evaluators
    : [];

  const hasAcknowledged = Boolean(evaluateeSignatureFilePath);

  return <>
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
            <MenuItem onClick={async () => {
              handleSettingsClose();
              await handleDownloadPDF();
            }}>Download Results</MenuItem>
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
                    <Box sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 2, mb: 1 }}>
                      {subcatScores.map(({ name, score, description, id }, idx) => (
                        <Grid container alignItems="center" spacing={2} sx={{ mb: 1 }} key={id}>
                          <Grid item sx={{ minWidth: 130, flexGrow: 0 }}>
                            <Box
                              component="span"
                              onMouseEnter={() => setHoveredSubcat(`name-${id}`)}
                              onMouseLeave={() => setHoveredSubcat(null)}
                              sx={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                position: 'relative',
                                color: '#222'
                              }}
                            >
                              {name}
                              {hoveredSubcat === `name-${id}` && !!description && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '100%',
                                    mt: 1,
                                    bgcolor: '#fffde7',
                                    color: '#444',
                                    zIndex: 10,
                                    boxShadow: 3,
                                    borderRadius: 1,
                                    border: '1px solid #ffe082',
                                    px: 2,
                                    py: 1,
                                    minWidth: 200,
                                    maxWidth: 320,
                                    fontSize: '0.97rem',
                                    pointerEvents: 'none',
                                    wordBreak: 'break-word',    
                                    overflow: 'auto',          
                                    maxHeight: 200,             
                                    whiteSpace: 'pre-line',
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#E9AE20', mb: 0.5 }}>
                                    Description
                                  </Typography>
                                  <Typography variant="body2">{description}</Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                          <Grid item xs zeroMinWidth sx={{ pr: 2 }}>
                            <Box
                              onMouseEnter={() => setHoveredSubcat(`bar-${name}`)}
                              onMouseLeave={() => setHoveredSubcat(null)}
                              sx={{ display: 'inline-block', width: '100%', position: 'relative' }}
                            >
                              <ScoreLinearBar
                                variant="determinate"
                                value={(score / 5) * 100}
                                sx={{ width: '100%', minWidth: 580 }}
                              />
                              {hoveredSubcat === `bar-${name}` && !!description && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: 0,
                                    top: '100%',
                                    mt: 1,
                                    bgcolor: '#fffde7',
                                    color: '#444',
                                    zIndex: 10,
                                    boxShadow: 3,
                                    borderRadius: 1,
                                    border: '1px solid #ffe082',
                                    px: 2,
                                    py: 1,
                                    minWidth: 200,
                                    maxWidth: 320,
                                    fontSize: '0.97rem',
                                    pointerEvents: 'none',
                                    wordBreak: 'break-word',    
                                    overflow: 'auto',          
                                    maxHeight: 200,             
                                    whiteSpace: 'pre-line',
                                  }}
                                >
                                  <Typography variant="body2" sx={{ fontWeight: 500, color: '#E9AE20', mb: 0.5 }}>
                                    Description
                                  </Typography>
                                  <Typography variant="body2">{description}</Typography>
                                </Box>
                              )}
                            </Box>
                          </Grid>
                          <Grid item sx={{ minWidth: 40, textAlign: 'right' }}>
                            <Typography sx={{ fontWeight: 'bold', ml: 1 }}>{score.toFixed(1)}</Typography>
                          </Grid>
                        </Grid>
                      ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Section Total */}
                    <Box sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 2, mb: 1 }}>
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
                {/* SHORT/LONG ANSWERS WITH HOVER OVERLAY */}
                {openAnswers.length > 0 && (
                  <Box sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 3, mb: 1 }}>
                    {openAnswers.map(subcat => (
                      <Box key={subcat.id} sx={{ mb: 2 }}>
                        <Box
                          onMouseEnter={() => setHoveredOpenAnswer(subcat.id)}
                          onMouseLeave={() => setHoveredOpenAnswer(null)}
                          sx={{ display: 'inline-block', fontWeight: 'bold', mb: 1, position: 'relative', cursor: !!subcat.description ? 'pointer' : 'default' }}
                        >
                          Open-ended Answers: {subcat.name}
                          {hoveredOpenAnswer === subcat.id && !!subcat.description && (
                            <Box
                              sx={{
                                position: 'absolute',
                                left: 0,
                                top: '100%',
                                mt: 1,
                                bgcolor: '#fffde7',
                                color: '#444',
                                zIndex: 10,
                                boxShadow: 3,
                                borderRadius: 1,
                                border: '1px solid #ffe082',
                                px: 2,
                                py: 1,
                                minWidth: 200,
                                maxWidth: 320,
                                fontSize: '0.97rem',
                                pointerEvents: 'none',
                                wordBreak: 'break-word',
                                overflow: 'auto',
                                maxHeight: 200,
                                whiteSpace: 'pre-line',
                              }}
                            >
                              <Typography variant="body2" sx={{ fontWeight: 500, color: '#E9AE20', mb: 0.5 }}>
                                Description
                              </Typography>
                              <Typography variant="body2">{subcat.description}</Typography>
                            </Box>
                          )}
                        </Box>
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

        {/* All Evaluators Section - Each in its own box, stacked vertically */}
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

        {/* All Commentors Section - Each in its own box, stacked vertically */}
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
                  {/* <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#E9AE20', mb: 0.5 }}>
                    {getOrderLabel(i)} Commentor
                  </Typography> */}
                  <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
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
  </>;
};

export default PerformanceEvaluationEvaluateePage;