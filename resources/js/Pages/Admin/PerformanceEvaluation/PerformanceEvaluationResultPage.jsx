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

// Utility for section scoring
function getSubcategoryScore(subcat) {
  let subScore = 0;
  if (subcat.subcategory_type === 'multiple_choice') {
    const selected = (subcat.options || []).find(opt => opt.option_answer);
    if (selected) subScore = Number(selected.score) || 0;
    return subScore;
  }
  if (subcat.subcategory_type === 'checkbox') {
    const selected = (subcat.options || []).filter(opt => opt.option_answer);
    const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
    const allSum = (subcat.options || []).reduce((sum, o) => sum + (Number(o.score) || 1), 0);
    if (allSum > 0) subScore = (selectedSum / allSum) * 100;
    return subScore;
  }
  if (subcat.subcategory_type === 'linear_scale') {
    if (subcat.percentage_answer && typeof subcat.percentage_answer.value === 'number') {
      const start = Number(subcat.linear_scale_start) || 1;
      const end = Number(subcat.linear_scale_end) || 5;
      const value = Number(subcat.percentage_answer.value);
      if (end > start) subScore = ((value - start) / (end - start)) * 100;
    }
    return subScore;
  }
  if (subcat.score && subcat.achieved_score) {
    return Math.min(100, (subcat.achieved_score / subcat.score) * 100);
  }
  return 0;
}

function computeSectionAverage(section) {
  const scorableSubcats = section.subcategories.filter(
    sub => ['multiple_choice', 'checkbox', 'linear_scale'].includes(sub.subcategory_type)
  );
  if (scorableSubcats.length === 0) return null;
  const avg = scorableSubcats.reduce(
    (sum, sub) => sum + getSubcategoryScore(sub),
    0
  ) / scorableSubcats.length;
  return avg;
}

function getSectionWeights(sections) {
  const totalScore = sections.reduce((sum, sec) => sum + (Number(sec.score) || 0), 0);
  return sections.reduce((acc, sec) => {
    acc[sec.id] = totalScore > 0 ? (Number(sec.score) || 0) / totalScore : 0;
    return acc;
  }, {});
}

function computeWeightedScores(sections) {
  const sectionWeights = getSectionWeights(sections);
  let weightedRows = [];
  let totalWeighted = 0;

  sections.forEach(section => {
    const avg = computeSectionAverage(section);
    const weight = sectionWeights[section.id] || 0;
    const weighted = avg != null ? (avg * weight) : 0;
    weightedRows.push({
      section: section.name,
      weight: weight,
      avg: avg,
      weighted: weighted
    });
    totalWeighted += weighted;
  });

  return {
    rows: weightedRows,
    grandTotal: totalWeighted,
  };
}

// Helper to render a single result panel (for original or comparison)
function renderResultPanel(result, title = "Evaluation Result") {
  if (!result) return null;
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
        {title}: <b>{result.form?.name}</b>
      </Typography>
      <Typography>Evaluatee: {getFullName(result.evaluatee)}</Typography>
      <Typography>Evaluator: {result.evaluators?.[0] ? getFullName(result.evaluators[0]) : ''}</Typography>
      <Typography>Period: {result.period_start_date} - {result.period_end_date}</Typography>
      <Divider sx={{ my: 2 }} />

      {/* Per-section breakdown */}
      {result.form.sections.map((section, idx) => {
        const avg = computeSectionAverage(section);
        // Only show section if average > 0
        if (!avg || avg === 0) return null;
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
                {section.subcategories.map(subcat => (
                  <TableRow key={subcat.id}>
                    <TableCell>{subcat.name}</TableCell>
                    <TableCell align="right">
                      {['multiple_choice', 'checkbox', 'linear_scale'].includes(subcat.subcategory_type)
                        ? `${getSubcategoryScore(subcat).toFixed(1)} %`
                        : 'N/A'
                      }
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Total Rating</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {avg != null ? `${avg.toFixed(2)} %` : 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        );
      })}

      {/* Weighted Scores Table */}
      <Divider sx={{ my: 2 }} />
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
            {(() => {
              const { rows, grandTotal } = computeWeightedScores(result.form.sections);
              return (
                <>
                  {rows.filter(row => row.avg && row.avg > 0).map(row => (
                    <TableRow key={row.section}>
                      <TableCell>{row.section + ' - ' + (row.weight * 100).toFixed(0) + ' %'}</TableCell>
                      <TableCell align="right">{row.avg !== null && !isNaN(row.avg) ? row.avg.toFixed(2) + ' %' : 'N/A'}</TableCell>
                      <TableCell align="right">{row.avg !== null && !isNaN(row.avg) ? (row.avg * row.weight / 100).toFixed(2) + ' %' : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'green' }}>
                      {rows.filter(row => row.avg && row.avg > 0).reduce((sum, row) => sum + row.weighted, 0).toFixed(2)} %
                    </TableCell>
                  </TableRow>
                </>
              );
            })()}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

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

  // Ref for the download section
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

  // Fetch compare result
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

  // Download handler with dynamic scaling to fit PDF
  const handleDownload = async () => {
    if (!resultsRef.current) return;

    const margin = 32; // 32pt ≈ 0.44 inches
    const pdfWidth = 841.89;
    const pdfHeight = 595.28;
    const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true });

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
  };

  return (
    <Layout title="Performance Evaluation Results">
      <Box
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
          >
            Download
          </Button>
        </Box>
        <div ref={resultsRef}>
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
              {/* ARROW in the middle if both selected */}
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
        </div>
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationResultPage;