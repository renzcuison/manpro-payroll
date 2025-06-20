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
import ScoreLinearBar from './Subsections/ScoreLinearBar';
import jsPDF from "jspdf";
import ModalReviewForm from './Modals/ModalReviewForm';

// Utility to calculate section and weighted scores
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
      }).then(() => {
        setAckModalOpen(false);
        navigate('/admin/performance-evaluation');
      });
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

  // PDF Export that matches Section 4 style for text answers AND includes signatures with smaller fonts
  const handleDownloadPDFClick = async () => {
    const doc = new jsPDF("p", "pt", "a4");
    const margin = 40;
    const cardWidth = 520;
    let y = margin;
    const gold = [233, 174, 32];

    const form = evaluationResponse.form;
    const responseMeta = evaluationResponse;

    // HEADER (Single form name, not repeated)
    doc.setFontSize(18);
    doc.setTextColor(34, 34, 34);
    doc.setFont(undefined, "bold");
    doc.text(form.name, margin, y);
    y += 32;

    doc.setFontSize(11);
    doc.setFont(undefined, "normal");
    doc.text(`Evaluatee:`, margin, y);
    doc.setFont(undefined, "bold");
    doc.text(responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : '', margin + 62, y);
    doc.setFont(undefined, "normal");
    y += 16;
    doc.text(`Evaluator:`, margin, y);
    doc.setFont(undefined, "bold");
    doc.text(responseMeta?.evaluators ? responseMeta.evaluators.map(getFullName).join(', ') : '', margin + 57, y);
    doc.setFont(undefined, "normal");
    y += 16;
    doc.text(`Period:`, margin, y);
    doc.setFont(undefined, "bold");
    doc.text(`${responseMeta.period_start_date} - ${responseMeta.period_end_date}`, margin + 40, y);
    y += 32;

    // --- SECTIONS ---
    form.sections.forEach((section, idx) => {
      // Compact Gold Bar Header (matches Image 6)
      const barHeight = 28;
      const barRadius = 5;
      doc.setFillColor(...gold);
      doc.roundedRect(margin, y, cardWidth, barHeight, barRadius, barRadius, "F");
      doc.setFontSize(15);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(section.name, margin + 20, y + barHeight / 3 + 4, { baseline: "middle" });

      y += barHeight; 
      y += 18;

      // Section Content: start right below!
      doc.setFontSize(12);
      doc.setFont(undefined, "normal");
      doc.setTextColor(51, 51, 51);

      const { sectionScore, subcatScores } = getSectionScore(section);
      subcatScores.forEach(({ name, score }) => {
        doc.setFont(undefined, "normal");
        doc.text(name, margin + 30, y);
        doc.text(`${score.toFixed(2)} %`, margin + cardWidth - 35, y, { align: "right" });
        y += 18;
      });

      doc.setFont(undefined, "bold");
      doc.text("Total Rating", margin + 30, y);
      doc.text(`${sectionScore.toFixed(2)} %`, margin + cardWidth - 35, y, { align: "right" });
      y += 20;

      // Divider and space before next section
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(1.2);
      doc.line(margin, y, margin + cardWidth, y);
      y += 20;
    });

    // --- Weighted Scores Card ---
    const weightedBarHeight = 28;
    doc.setFillColor(...gold);
    doc.roundedRect(margin, y, cardWidth, weightedBarHeight, 5, 5, "F");
    doc.setFontSize(15);
    doc.setFont(undefined, "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("Weighted Scores", margin + 20, y + weightedBarHeight / 3 + 4, { baseline: "middle" });

    y += weightedBarHeight;
    y += 18;


    // Table Header (aligned columns)
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("Section (Score Set)", margin + 20, y);
    doc.text("Subcategory Average", margin + 220, y);
    doc.text("Weighted Average", margin + 410, y);
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1.2);
    y += 10;

    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    let totalWeighted = 0;
    const weightedSections = form.sections.filter(section =>
      section.subcategories.some(sc =>
        sc.subcategory_type === 'multiple_choice' ||
        sc.subcategory_type === 'checkbox' ||
        sc.subcategory_type === 'linear_scale'
      )
    );
    weightedSections.forEach(section => {
      const { sectionScore, weightedScore } = getSectionScore(section);
      totalWeighted += weightedScore;
      doc.text(`${section.name} - ${section.score || 0}%`, margin + 20, y);
      doc.text(`${sectionScore.toFixed(2)} %`, margin + 280, y, { align: "right" });
      doc.text(`${weightedScore.toFixed(2)} %`, margin + 495, y, { align: "right" });
      y += 18;
    });
    // Table Total
    doc.setFont(undefined, "bold");
    doc.setTextColor(51,153,85);
    doc.text("Total", margin + 20, y);
    doc.text(`${totalWeighted.toFixed(2)} %`, margin + 495, y, { align: "right" });
    y += 18;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1.2);
    doc.line(margin, y, margin + cardWidth, y);
    y += 28;

    // --- Comments Section ---
    doc.setFontSize(13);
    doc.setFont(undefined, "bold");
    doc.setTextColor(51, 51, 51);
    doc.text("Comments:", margin, y);
    y += 18;

    // Evaluator
    if (Array.isArray(responseMeta.evaluators) && responseMeta.evaluators.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(51, 51, 51);
      doc.text("Evaluator:", margin, y);
      y += 15;
      responseMeta.evaluators.forEach((evaluator) => {
        if (y > 700) { doc.addPage(); y = margin; }
        doc.setFont(undefined, "bold");
        doc.setFontSize(11);
        doc.setTextColor(34,34,34);
        doc.text(getFullName(evaluator), margin+8, y);
        y += 14;
        doc.setFont(undefined, "normal");
        doc.setFontSize(11);
        doc.setTextColor(80,80,80);
        let comment = evaluator.comment || "";
        if (comment) {
          const commentLines = doc.splitTextToSize(comment, 490);
          doc.text(commentLines, margin+16, y);
          y += commentLines.length * 13 + 3;
        } else {
          doc.text("(No comment provided)", margin+16, y);
          y += 14;
        }
        y += 12;
      });
    }

    // Commentors
    if (Array.isArray(responseMeta.commentors) && responseMeta.commentors.length > 0) {
      responseMeta.commentors.forEach((commentor, idx) => {
        if (y > 700) { doc.addPage(); y = margin; }
        doc.setFont(undefined, "bold");
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);
        doc.text(`Commentor ${idx + 1}:`, margin, y);
        y += 15;
        doc.setFont(undefined, "bold");
        doc.setFontSize(11);
        doc.setTextColor(34,34,34);
        doc.text(getFullName(commentor), margin+8, y);
        y += 14;
        doc.setFont(undefined, "normal");
        doc.setFontSize(11);
        doc.setTextColor(80,80,80);
        let comment = commentor.comment || "";
        if (comment) {
          const commentLines = doc.splitTextToSize(comment, 490);
          doc.text(commentLines, margin+16, y);
          y += commentLines.length * 13 + 3;
        } else {
          doc.text("(No comment provided)", margin+16, y);
          y += 14;
        }
        y += 12;
      });
    }

    y += 6;

    // --- Signatures grid (3 per row, white rounded cards) ---
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.setFont(undefined, "bold");
    doc.text("Signatures:", margin, y);
    y += 16;

    const signatureBlocks = [];
    if (creatorSignatureFilePath) {
      let creatorName = form?.creator_user_name ? `${ form.creator_user_name } (Creator)` : "Creator";
      if (form?.creator_updated_at) creatorDate = form.creator_updated_at.slice(0, 10);
      else if (form?.creator_sign_date) creatorDate = form.creator_sign_date.slice(0, 10);
      signatureBlocks.push({ url: creatorSignatureFilePath, name: creatorName, date: creatorDate });

      let creatorDate = responseMeta?.media[0].created_at.split('T')[0];
      signatureBlocks.push({
        url: creatorSignatureFilePath,
        name: creatorName,
        date: creatorDate,
      });
    }
    if (evaluateeSignatureFilePath) {
      let evalDate = responseMeta?.media[1].created_at.split('T')[0];
      signatureBlocks.push({
        url: evaluateeSignatureFilePath,
        name: responseMeta?.evaluatee ? `${getFullName(responseMeta.evaluatee)} (Evaluatee)` : "Evaluatee",
        date: evalDate,
      });
    }
    if (responseMeta?.evaluators) {
      for (const evaluator of responseMeta.evaluators) {
        const signatureFilePath = signatureFilePaths[evaluator.evaluator_id];
        if (signatureFilePath) {
          let evalDate = evaluator.updated_at ? evaluator.updated_at.slice(0, 10) : "";
          signatureBlocks.push({
            url: signatureFilePath,
            name: `${getFullName(evaluator)} (Evaluator)`,
            date: evalDate,
          });
        }
      }
    }
    if (responseMeta?.commentors) {
      for (const commentor of responseMeta.commentors) {
        const signatureFilePath = signatureFilePaths[commentor.commentor_id];
        if (signatureFilePath) {
          let commDate = commentor.updated_at ? commentor.updated_at.slice(0, 10) : "";
          signatureBlocks.push({
            url: signatureFilePath,
            name: `${getFullName(commentor)} (Commentor)`,
            date: commDate,
          });
        }
      }
    }

    const colWidth = 155, sigImgHeight = 36, sigImgWidth = 100;
    let col = 0, row = 0, startY = y;
    for (let i = 0; i < signatureBlocks.length; ++i) {
      const sig = signatureBlocks[i];
      const x = margin + col * (colWidth + 8);
      const y0 = startY + row * 70;

      try {
        if (!sig.url || sig.url === "data:image/png;base64,")
          throw new Error();
        const img = new window.Image();
        img.src = sig.url;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        doc.addImage(img, "PNG", x + (colWidth-sigImgWidth)/2, y0 + 6, sigImgWidth, sigImgHeight);
      } catch (e) {
        doc.setFontSize(9);
        doc.setFont(undefined, "italic");
        doc.setTextColor(180, 180, 180);
        doc.text("(no signature)", x + colWidth/2, y0 + 22, { align: "center" });
      }
      // Signature owner name
      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      doc.setTextColor(90,90,90);
      doc.text(sig.name, x + colWidth/2, y0 + 53, { align: "center" });

      // Signature date (on the line below name)
      if (sig.date) {
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.setTextColor(120,120,120);
        doc.text(sig.date, x + colWidth/2, y0 + 62, { align: "center" });
      }

      col++;
      if (col === 3) { col = 0; row++; }
    }

    doc.save(`evaluation_${form.name.replace(/\s+/g, '_')}.pdf`);
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

  return (
    <Layout title="Performance Evaluation Answers">
      <Box sx={{
        mt: 5,
        p: 5,
        bgcolor: 'white',
        borderRadius: '8px',
        maxWidth: '1000px',
        mx: 'auto',
        boxShadow: 3,
      }}>
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
            <MenuItem onClick={() => { handleSettingsClose(); setTimeout(() => navigate('/admin/performance-evaluation'), 100); }}>Exit Form</MenuItem>
            <MenuItem onClick={() => { handleSettingsClose(); setReviewModalOpen(true); }}>View Form</MenuItem>
            <MenuItem onClick={async () => { handleSettingsClose(); await handleDownloadPDFClick(); }}>Download</MenuItem>
          </Menu>
          <ModalReviewForm open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} id={id} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>{form.name}</Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#777', mb: 1 }}>
          Employee Name: {responseMeta?.evaluatee ? getFullName(responseMeta.evaluatee) : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Evaluators: {responseMeta?.evaluators ? responseMeta.evaluators.map(evaluator => getFullName(evaluator)).join(' & ') : ''}
        </Typography>
        <Typography variant="body1" sx={{ color: '#777', mb: 2 }}>
          Period Availability: {responseMeta.period_start_date} to {responseMeta.period_end_date}
        </Typography>

        {/* Sections as cards */}
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
                {/* Scored subcategories (bars) */}
                {hasScorableSubcats && (
                  <>
                    <Box sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 2, mb: 1 }}>
                      {subcatScores.map(({ name, score, description, id }) => (
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
                {/* Open-ended/Text answers (Section 4 style) */}
                {openAnswers.length > 0 && (
                  <Box sx={{ width: '100%', maxWidth: 800, mx: "auto", mt: 3, mb: 1 }}>
                    {openAnswers.map(subcat => (
                      <Box key={subcat.id} sx={{ mb: 2 }}>
                        <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          Open-ended Answers: {subcat.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#444', flex: 1 }}>
                          {subcat.text_answer?.answer || (
                            <span style={{ color: "#bbb", fontStyle: "italic" }}>No answer</span>
                          )}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}

        {/* Weighted Section Scores Summary */}
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

        {/* All Commentors Section */}
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
  );
};

export default PerformanceEvaluationEvaluateePage;