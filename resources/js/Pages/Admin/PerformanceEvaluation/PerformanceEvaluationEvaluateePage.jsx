import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Accordion, AccordionSummary, AccordionDetails,
  IconButton, Menu, MenuItem, Paper, TextField, Grid, Button, Table, TableHead, TableBody, TableRow, TableCell, Divider
} from '@mui/material';
import { getFullName } from '../../../utils/user-utils';
import Layout from '../../../components/Layout/Layout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEvaluationResponse } from '../../../hooks/useEvaluationResponse';
import PerformanceEvaluationEvaluateeAcknowledge from './Modals/PerformanceEvaluationEvaluateeAcknowledge';
import Swal from 'sweetalert2';
import ScoreLinearBar from './Test/ScoreLinearBar';
import jsPDF from "jspdf";
import ModalReviewForm from './Modals/ModalReviewForm';

const getSectionScore = (section) => {
  if (!section || !section.subcategories) return { sectionScore: 0, subcatScores: [], weightedScore: 0 };
  let scoreTotal = 0;
  let counted = 0;
  const subcatScores = [];

  section.subcategories.forEach(subcat => {
    let subScore = 0;
    if (subcat.subcategory_type === 'multiple_choice') {
      const selected = subcat.options.find(opt => opt.option_answer);
      if (selected) {
        subScore = Number(selected.score) || 0;
      }
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    } else if (subcat.subcategory_type === 'checkbox') {
      const selected = subcat.options.filter(opt => opt.option_answer);
      const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      const allSum = subcat.options.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      if (allSum > 0) {
        subScore = (selectedSum / allSum) * 100;
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
          subScore = ((value - start) / (end - start)) * 100;
        }
      }
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    }
  });

  const sectionScore = counted > 0 ? scoreTotal / counted : 0;
  const weightedScore = ((sectionScore / 100) * (section.score || 0));
  return { sectionScore, subcatScores, weightedScore };
};



const PerformanceEvaluationEvaluateePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    creatorSignatureFilePath, evaluateeSignatureFilePath, evaluationResponse, signatureFilePaths,
    editEvaluationSignature
  } = useEvaluationResponse(id);

  const [loading, setLoading] = useState(true);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [savingAcknowledge, setSavingAcknowledge] = useState(false);
  const [hoveredSubcat, setHoveredSubcat] = useState(null);
  const [hoveredOpenAnswer, setHoveredOpenAnswer] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

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
  console.log(evaluationResponse);
  const doc = new jsPDF("p", "pt", "a4");
  const margin = 40;
  let y = margin;

  const form = evaluationResponse.form;
  const responseMeta = evaluationResponse;

  // Centered Form Name
  doc.setFontSize(22);
  doc.setFont(undefined, "bold");
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text(form.name, pageWidth / 2, y, { align: "center" });
  y += 36;

  // Employee, Evaluator(s), Period
  doc.setFontSize(13);
  doc.setFont(undefined, "normal");
  doc.text(`Employee Name:`, margin, y);
  doc.setFont(undefined, "bold");
  doc.text(`${getFullName(responseMeta?.evaluatee) || ''}`, margin + 120, y);
  doc.setFont(undefined, "normal");
  y += 18;
  doc.text(`Evaluator(s):`, margin, y);
  doc.setFont(undefined, "bold");
  doc.text(`${responseMeta?.evaluators ? responseMeta.evaluators.map(getFullName).join(', ') : ''}`, margin + 120, y);
  doc.setFont(undefined, "normal");
  y += 18;
  doc.text(`Period:`, margin, y);
  doc.setFont(undefined, "bold");
  doc.text(`${responseMeta.period_start_date} to ${responseMeta.period_end_date}`, margin + 120, y);
  doc.setFont(undefined, "normal");
  y += 28;

  // Sections
  for (const section of form.sections) {
    doc.setFontSize(15);
    doc.setFont(undefined, "bold");
    doc.text(`${section.name}`, margin, y);
    doc.setFont(undefined, "normal");
    y += 18;

    if (section.category) {
      doc.setFontSize(12);
      doc.setFont(undefined, "italic");
      doc.text(section.category, margin + 8, y);
      doc.setFont(undefined, "normal");
      y += 16;
    }

    for (const subcat of section.subcategories) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(subcat.name, margin + 16, y);
      doc.setFont(undefined, "normal");
      y += 14;

      doc.setFontSize(11);
      doc.text(`Response Type:`, margin + 32, y);
      doc.text(
        `${subcat.subcategory_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        margin + 120,
        y
      );
      y += 13;

      if (subcat.description) {
        doc.text(`Description:`, margin + 32, y);
        const descLines = doc.splitTextToSize(subcat.description, 350);
        doc.text(descLines, margin + 120, y);
        y += descLines.length * 12;
      }

      // Answers
      let answerText = '';
      if (subcat.subcategory_type === 'multiple_choice') {
        const selected = subcat.options.find(opt => opt.option_answer);
        answerText = selected ? selected.label : "(No answer)";
      } else if (subcat.subcategory_type === 'checkbox') {
        const selected = subcat.options.filter(opt => opt.option_answer).map(opt => opt.label);
        answerText = selected.length > 0 ? selected.join(', ') : "(No answer)";
      } else if (subcat.subcategory_type === 'linear_scale') {
        answerText = typeof subcat.percentage_answer?.value === 'number'
          ? String(subcat.percentage_answer.value)
          : "(No answer)";
      } else if (subcat.subcategory_type === 'short_answer' || subcat.subcategory_type === 'long_answer') {
        answerText = subcat.text_answer?.answer || "(No answer)";
      }
      doc.text(`Answer/s:`, margin + 32, y);
      const answerLines = doc.splitTextToSize(answerText, 350);
      doc.text(answerLines, margin + 120, y);
      y += answerLines.length * 13 + 8;

      // page break if needed
      if (y > 740) { doc.addPage(); y = margin; }
    }
    y += 10;
  }

  // Evaluator Comments
  if (responseMeta.evaluators && responseMeta.evaluators.length > 0) {
    for (const evaluator of responseMeta.evaluators) {
      doc.setFontSize(13);
      doc.setFont(undefined, "bold");
      doc.text("Evaluator Comment:", margin, y);
      doc.setFont(undefined, "normal");
      y += 16;
      const evalComment = evaluator.comment || "(No comment provided)";
      const evalCommentLines = doc.splitTextToSize(evalComment, 450);
      doc.text(evalCommentLines, margin + 20, y);
      y += evalCommentLines.length * 13 + 8;
      if (y > 740) { doc.addPage(); y = margin; }
    }
  }

  // Commentors
  if (responseMeta.commentors && responseMeta.commentors.length > 0) {
    let idx = 1;
    for (const commentor of responseMeta.commentors) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(`Commenter ${idx}: ${getFullName(commentor)}`, margin, y);
      doc.setFont(undefined, "normal");
      y += 15;
      const comment = commentor.comment || "(No comment provided)";
      const commentLines = doc.splitTextToSize(comment, 420);
      doc.text(commentLines, margin + 20, y);
      y += commentLines.length * 13 + 8;
      idx++;
      if (y > 740) { doc.addPage(); y = margin; }
    }
  }

  // Signatures header
  y += 20;
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Signatures:", margin, y);
  doc.setFont(undefined, "normal");
  y += 12;

  // Gather all signatures
  const signatureBlocks = [];

  // Creator (if you have a creator name, otherwise fallback)
  if (creatorSignatureFilePath) {
    // Try to find the creator's name or fallback to "Creator"
    let creatorName = "Creator";
    if (form?.creator_user_name) creatorName = form.creator_user_name + " (Creator)";
    signatureBlocks.push({
      url: creatorSignatureFilePath,
      name: creatorName,
    });
  }

  // Evaluatee
  if (evaluateeSignatureFilePath) {
    signatureBlocks.push({
      url: evaluateeSignatureFilePath,
      name: responseMeta?.evaluatee
        ? `${getFullName(responseMeta.evaluatee)} (Evaluatee)`
        : "Evaluatee",
    });
  }

  // Evaluators
  if (responseMeta?.evaluators) {
    for (const evaluator of responseMeta.evaluators) {
      const signatureFilePath = signatureFilePaths[evaluator.id];
      if (signatureFilePath) {
        signatureBlocks.push({
          url: signatureFilePath,
          name: `${getFullName(evaluator)} (Evaluator)`,
        });
      }
    }
  }

  // Commentors
  if (responseMeta?.commentors) {
    for (const commentor of responseMeta.commentors) {
      const signatureFilePath = signatureFilePaths[commentor.id];
      if (signatureFilePath) {
        signatureBlocks.push({
          url: signatureFilePath,
          name: `${getFullName(commentor)} (Commentor)`,
        });
      }
    }
  }

  // Helper to render a signature cell
  async function drawSignatureCell(sig, x, y, cellWidth) {
    const imgWidth = 120;
    const imgHeight = 40;
    try {
      if(!sig.url || sig.url === "data:image/png;base64,")
        throw new Error();
      const img = new window.Image();
      img.src = sig.url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      const imgX = x + (cellWidth - imgWidth) / 2;
      doc.addImage(img, "PNG", imgX, y, imgWidth, imgHeight);
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text(sig.name, x + cellWidth / 2, y + imgHeight + 16, { align: "center" });
    } catch (e) {
      doc.setFontSize(10);
      doc.setFont(undefined, "italic");
      doc.text(`${sig.name} (signature not found)`, x + cellWidth / 2, y + 15, { align: "center" });
    }
  }

  // Draw signatures in 2-column rows
  const cellWidth = 210; // adjust as needed
  const startX = margin; // left margin
  let sigY = y + 10; // starting y for signatures

  for (let i = 0; i < signatureBlocks.length; i += 2) {
    // First column
    await drawSignatureCell(signatureBlocks[i], startX, sigY, cellWidth);
    // Second column (if exists)
    if (signatureBlocks[i + 1]) {
      await drawSignatureCell(signatureBlocks[i + 1], startX + cellWidth + 40, sigY, cellWidth);
    }
    sigY += 70; // vertical space per row
    if (sigY > 740) { doc.addPage(); sigY = margin; }
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
            <MenuItem
              onClick={() => {
                handleSettingsClose();
                setReviewModalOpen(true);
              }}
            >
              View Form
            </MenuItem>
            
            <MenuItem onClick={async () => {
              handleSettingsClose();
              await handleDownloadPDF();
            }}>Download</MenuItem>
          </Menu>
                    <ModalReviewForm
              open={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              id={id} // pass the evaluation id
            />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
            {form.name}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Employee Name: {responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}
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
                  cursor: 'default!important',
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
                                cursor: 'default',
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
                              onMouseEnter={() => setHoveredSubcat(`bar-${id}`)}
                              onMouseLeave={() => setHoveredSubcat(null)}
                              sx={{ display: 'inline-block', width: '100%', position: 'relative' }}
                            >
                              <ScoreLinearBar
                                variant="determinate"
                                value={(score)}
                                sx={{ width: '100%', minWidth: 550 }}
                              />
                              {hoveredSubcat === `bar-${id}` && !!description && (
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
                            <Typography sx={{ fontWeight: 'bold', ml: 1 }}>{score.toFixed(1)} %</Typography>
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
                            value={(sectionScore)}
                            sx={{ width: '100%', minWidth: 550 }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Typography sx={{ fontWeight: 700, ml: 1 }}>{sectionScore.toFixed(1)} %</Typography>
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
                          sx={{ display: 'inline-block', fontWeight: 'bold', mb: 1, position: 'relative', cursor: 'default' }}
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

        {/* --- Weighted Section Scores Summary (styled like sections) --- */}
        <Box sx={{ mt: 6, mb: 4, bgcolor: 'white', borderRadius: 2, boxShadow: 3 }}>
          <Box
            sx={{
              bgcolor: '#E9AE20',
              borderBottom: '1px solid #ffe082',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              py: 2,
              px: 3
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: "white" }}>
              Weighted Scores
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 16 }}>Section (Score Set)</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16 }}>Subcategory Average</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16 }}>Weighted Average</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {form.sections.filter(section =>
                  section.subcategories.some(sc =>
                    sc.subcategory_type === 'multiple_choice' ||
                    sc.subcategory_type === 'checkbox' ||
                    sc.subcategory_type === 'linear_scale'
                  )
                ).map(section => {
                  const { sectionScore, weightedScore } = getSectionScore(section);
                  return (
                    <TableRow key={section.id}>
                      <TableCell>
                        {section.name} - <b>{section.score || 0} %</b>
                      </TableCell>
                      <TableCell align="right">{sectionScore.toFixed(2)} %</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{weightedScore.toFixed(2)} %</TableCell>
                    </TableRow>
                  );
                })}
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, fontSize: 18 }}>Total</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: "#137333", fontSize: 18 }}>
                    {form.sections
                      .filter(section =>
                        section.subcategories.some(sc =>
                          sc.subcategory_type === 'multiple_choice' ||
                          sc.subcategory_type === 'checkbox' ||
                          sc.subcategory_type === 'linear_scale'
                        )
                      )
                      .reduce((sum, section) =>
                        sum + getSectionScore(section).weightedScore, 0
                      ).toFixed(2)
                    } %
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Box>

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
                      justifyContent: "space-between",
                      mt: 1,
                    }}
                  >
                    <TextField
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        readOnly: true,
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
                      value={evaluator.comment || ''}
                      placeholder="No comment provided"
                      sx={{
                        pb: 2,
                        '& .MuiInputBase-input': { padding: 0 },
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
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <TextField
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                          readOnly: true,
                          style: {
                            fontSize: "1rem",
                            fontWeight: 400,
                            color: "#222",
                          }
                        }}
                        label="Commentor Comment"
                        multiline
                        minRows={3}
                        fullWidth
                        value={commentor.comment || ''}
                        placeholder="No comment provided"
                        sx={{
                          pb: 2,
                          '& .MuiInputBase-input': { padding: 0 },
                          '& label': { color: '#999', fontWeight: 400 }
                        }}
                      />
                      {commentor.updated_at && commentor.signature_filepath &&(
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
                          Signed - {commentor.updated_at.slice(0, 10)}
                        </Typography>
                      )}
                    </Box>
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
