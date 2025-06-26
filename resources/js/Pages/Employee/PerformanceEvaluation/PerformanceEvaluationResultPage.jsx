import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, Divider, Select, MenuItem, FormControl, InputLabel, IconButton, Button
} from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import { getFullName } from '../../../utils/user-utils';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Utility: Section and weighted scores (copied from your Evaluatee page for consistency)
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
      const scores = subcat.options.map(opt => Number(opt.score));
      const start = Math.min(...scores);
      const end = Math.max(...scores);
      const selectedOpt = subcat.options.find(opt => opt.option_answer != null);
      const value = selectedOpt ? Number(selectedOpt.score) : null;
      let subScore = 0;
      if (value !== null && end > start) {
        subScore = ((value - start) / (end - start)) * 100;
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

const PerformanceEvaluationResultPage = () => {
  const storedUser = localStorage.getItem("nasya_user");
  const user = JSON.parse(storedUser);
  const headers = getJWTHeader(user);
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  // For compare dropdown
  const [compareResultId, setCompareResultId] = useState('');
  const [compareResult, setCompareResult] = useState(null);

  const [loading, setLoading] = useState(true);

  // Ref for the download section - WRAP the WHOLE card area including header, dropdowns, etc.
  const resultsRef = useRef();

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/getEvaluationResponses', { headers })
      .then(res => {
        const filtered = (res.data.evaluationResponses || []).filter(
          r =>
            r.role === 'Evaluatee' &&
            r.status === 'Done'
        );
        setResults(filtered);
        if (filtered.length === 1) {
          setSelectedResultId(filtered[0].id);
        } else if (filtered.length > 0 && !selectedResultId) {
          setSelectedResultId(filtered[0].id);
        }
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!selectedResultId) {
      setSelectedResult(null);
      return;
    }
    setLoading(true);
    axiosInstance.get('/getEvaluationResponse', {
      headers,
      params: { id: selectedResultId },
    })
      .then(res => setSelectedResult(res.data.evaluationResponse))
      .catch(() => setSelectedResult(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [selectedResultId]);

  useEffect(() => {
    if (!compareResultId) {
      setCompareResult(null);
      return;
    }
    setLoading(true);
    axiosInstance.get('/getEvaluationResponse', {
      headers,
      params: { id: compareResultId },
    })
      .then(res => setCompareResult(res.data.evaluationResponse))
      .catch(() => setCompareResult(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [compareResultId]);

  // PDF Download - screenshot the whole card area with header and dropdowns
  const handleDownload = async () => {
    if (!resultsRef.current) return;

    // Hide all elements with .no-export class (download button, X button, etc)
    const toHide = resultsRef.current.querySelectorAll('.no-export');
    toHide.forEach(el => (el.style.display = 'none'));

    const margin = 20;
    const pdfWidth = 841.89;   // A4 landscape width in points
    const pdfHeight = 595.28;  // A4 landscape height in points

    // Capture with white background for consistency
    const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const contentWidth = canvas.width;
    const contentHeight = canvas.height;
    const targetWidth = pdfWidth - 2 * margin;
    const targetHeight = pdfHeight - 2 * margin;
    const scale = Math.min(targetWidth / contentWidth, targetHeight / contentHeight, 1);
    const imgWidth = contentWidth * scale;
    const imgHeight = contentHeight * scale;
    const x = (pdfWidth - imgWidth) / 2;
    const y = Math.max(margin, (pdfHeight - imgHeight) / 2);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [pdfWidth, pdfHeight]
    });

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save('Performance_Evaluation_Result.pdf');

    // Restore hidden elements
    toHide.forEach(el => (el.style.display = ''));
  };

  function renderResultPanel(result, title = "Evaluation Result") {
    if (!result) return null;
    const form = result.form;
    return (
      <Paper
        sx={{
          p: 3,
          mt: 2,
          minWidth: 0,
          flex: 1,
          boxShadow: '0 2px 6px rgba(60,60,60,0.10)',
          borderRadius: 2,
          border: '1px solid #eee',
          mx: { xs: 0, md: 2 },
        }}
        elevation={0}
        className="export-result-panel"
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}: <b>{form?.name}</b>
        </Typography>
        <Typography>Evaluatee: {getFullName(result.evaluatee)}</Typography>
        <Typography>Evaluator: {Array.isArray(result.evaluators) ? result.evaluators.map(getFullName).join(', ') : ''}</Typography>
        <Typography>Period: {result.period_start_date} - {result.period_end_date}</Typography>
        <Divider sx={{ my: 2 }} />

        {/* Per-section breakdown (hide if total rating is 0%) */}
        {form.sections.map((section, idx) => {
          const { sectionScore, subcatScores } = getSectionScore(section);
          if (sectionScore === 0) return null;
          return (
            <Box key={section.id || idx} sx={{ mb: 3 }}>
              <Typography sx={{
                fontWeight: 'bold',
                color: '#fff',
                bgcolor: '#f5c242',
                p: 1,
                borderRadius: 1,
                fontSize: 16,
                mb: 1
              }}>
                {section.name}
              </Typography>
              <Table size="small" sx={{ my: 1 }}>
                <TableBody>
                  {subcatScores.map(subcat => (
                    <TableRow key={subcat.id}>
                      <TableCell>{subcat.name}</TableCell>
                      <TableCell align="right">
                        {`${subcat.score.toFixed(1)} %`}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total Rating</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {`${sectionScore.toFixed(2)} %`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          );
        })}

        {/* Weighted Scores Table */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{
            fontWeight: 'bold',
            color: '#fff',
            bgcolor: '#f5c242',
            p: 1,
            borderRadius: 1,
            fontSize: 16,
            mb: 1
          }}>
            Weighted Scores
          </Typography>
          <Table size="small" sx={{ my: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Section (Score Set)</TableCell>
                <TableCell align="right">Subcategory Average</TableCell>
                <TableCell align="right">Weighted Average</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.sections.filter(section =>
                section.subcategories.some(sc =>
                  sc.subcategory_type === 'multiple_choice' ||
                  sc.subcategory_type === 'checkbox' ||
                  sc.subcategory_type === 'linear_scale'
                )
              )
              .map(section => {
                const { sectionScore, weightedScore } = getSectionScore(section);
                if (sectionScore === 0) return null;
                return (
                  <TableRow key={section.id}>
                    <TableCell>
                      {section.name} - <b>{section.score || 0} %</b>
                    </TableCell>
                    <TableCell align="right">{sectionScore.toFixed(2)} %</TableCell>
                    <TableCell align="right">{weightedScore.toFixed(2)} %</TableCell>
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'green' }}>
                  {form.sections
                    .filter(section =>
                      section.subcategories.some(sc =>
                        sc.subcategory_type === 'multiple_choice' ||
                        sc.subcategory_type === 'checkbox' ||
                        sc.subcategory_type === 'linear_scale'
                      )
                    )
                    .reduce((sum, section) => {
                      const { sectionScore, weightedScore } = getSectionScore(section);
                      return sectionScore === 0 ? sum : sum + weightedScore;
                    }, 0)
                    .toFixed(2)
                  } %
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>
    );
  }

  // NOW resultsRef wraps the whole exportable area (header, dropdowns, etc.)
  return (
    <Layout title="Performance Evaluation Results">
      <Box
        ref={resultsRef}
        sx={{
          mt: 4,
          p: 4,
          bgcolor: 'white',
          borderRadius: 2,
          maxWidth: '1400px',
          mx: 'auto',
          boxShadow: 3,
          position: 'relative',
          px: { xs: 2, md: 6, lg: 8 }
        }}
      >
        {/* X (Close) Button */}
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: 'absolute',
            top: 25,
            right: 30,
            border: '1px solid #BEBEBE',
            borderRadius: '50%',
            padding: '5px',
            color: '#BEBEBE',
          }}
          className="no-export"
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Performance Evaluation Result</Typography>
        {/* Download button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading || (!selectedResult && !compareResult)}
            sx={{
              borderColor: '#f5c242',
              color: '#f5c242',
              '&:hover': {
                borderColor: '#f5c242',
                bgcolor: '#fffbe6'
              }
            }}
            className="no-export" // Hide during export if desired
          >
            Download
          </Button>
        </Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && results.length === 0 && (
          <Typography variant="body1" color="gray" sx={{ mt: 4 }}>
            You have no evaluation results.
          </Typography>
        )}

        {!loading && results.length > 0 && (
          <Box sx={{
            display: { xs: 'block', md: 'flex' },
            gap: 3,
            width: '100%',
            mx: { xs: 0, md: 0 },
          }}>
            <Box sx={{ flex: 1, minWidth: 0, maxWidth: compareResult ? { md: '46%' } : { md: '900px' }, mx: compareResult ? 0 : 'auto' }}>
              <FormControl sx={{ minWidth: 280, mb: 3, width: '100%' }}>
                <InputLabel>Select Evaluation</InputLabel>
                <Select
                  value={selectedResultId}
                  label="Select Evaluation"
                  onChange={e => setSelectedResultId(e.target.value)}
                >
                  <MenuItem value="" disabled>Select Evaluation Result</MenuItem>
                  {results.map(r => (
                    <MenuItem value={r.id} key={r.id}>
                      {r.form?.name} — {r.date}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {selectedResult && renderResultPanel(selectedResult, "Evaluation Result")}
            </Box>
            {compareResult && (
              <Box sx={{
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                fontSize: 40,
                color: '#BEBEBE'
              }}>
                &rarr;
              </Box>
            )}
            <Box sx={{ flex: 1, minWidth: 0, maxWidth: compareResult ? { md: '46%' } : { md: '900px' }, mx: compareResult ? 0 : 'auto' }}>
              <FormControl sx={{ minWidth: 280, mb: 3, width: '100%' }}>
                <InputLabel>Compare to</InputLabel>
                <Select
                  value={compareResultId}
                  label="Compare to"
                  onChange={e => setCompareResultId(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {results
                    .filter(r => r.id !== selectedResultId)
                    .map(r => (
                      <MenuItem value={r.id} key={r.id}>
                        {r.form?.name} — {r.date}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              {compareResult && renderResultPanel(compareResult, "Comparison Result")}
            </Box>
          </Box>
        )}
        {!loading && results.length > 0 && !selectedResultId && (
          <Typography variant="body1" color="gray" sx={{ mt: 4 }}>
            Select a result above to view your evaluation.
          </Typography>
        )}
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationResultPage;