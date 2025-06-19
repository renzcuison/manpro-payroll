import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, Divider, Select, MenuItem, FormControl, InputLabel, IconButton
} from '@mui/material';
import Layout from '../../../components/Layout/Layout';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { getFullName } from '../../../utils/user-utils';
import { useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';

const PerformanceEvaluationResultPage = () => {
  const storedUser = localStorage.getItem("nasya_user");
  const user = JSON.parse(storedUser);
  const headers = getJWTHeader(user);
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch completed evaluations where user is Evaluatee
  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/getEvaluationResponses', { headers })
      .then(res => {
        const filtered = (res.data.evaluationResponses || []).filter(
          r =>
            r.role === 'Evaluatee' &&
            r.evaluatee?.id === user.id &&
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

  // Fetch detail of selected evaluation
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

  // Util: Subcategory scoring logic
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

  // Compute section average as mean of scorable subcategory percentages
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

  // Utility: Compute section weights from section.score
  function getSectionWeights(sections) {
    const totalScore = sections.reduce((sum, sec) => sum + (Number(sec.score) || 0), 0);
    return sections.reduce((acc, sec) => {
      acc[sec.id] = totalScore > 0 ? (Number(sec.score) || 0) / totalScore : 0;
      return acc;
    }, {});
  }

  // Weighted scores table calculation
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

  return (
    <Layout title="Performance Evaluation Results">
      <Box sx={{
        mt: 4, p: 4, bgcolor: 'white', borderRadius: 2,
        maxWidth: '900px', mx: 'auto', boxShadow: 3, position: 'relative'
      }}>
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
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && results.length === 0 && (
          <Typography variant="body1" color="gray" sx={{ mt: 4 }}>
            You have no completed evaluation results.
          </Typography>
        )}
        {!loading && results.length > 0 && selectedResult && (
          <>
            <FormControl sx={{ minWidth: 300, mb: 3 }}>
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
            <Paper sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Form Name: <b>{selectedResult.form?.name}</b>
              </Typography>
              <Typography>Evaluatee: {getFullName(selectedResult.evaluatee)}</Typography>
              <Typography>Evaluator: {selectedResult.evaluators?.[0] ? getFullName(selectedResult.evaluators[0]) : ''}</Typography>
              <Typography>Period: {selectedResult.period_start_date} - {selectedResult.period_end_date}</Typography>
              <Divider sx={{ my: 2 }} />

              {/* Per-section breakdown */}
              {selectedResult.form.sections.map((section, idx) => (
                <Box key={section.id || idx} sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 'bold', color: '#ffffff', bgcolor: '#f5c242', p: 1, borderRadius: 1 }}>
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
                          {(() => {
                            const avg = computeSectionAverage(section);
                            return avg != null ? `${avg.toFixed(2)} %` : 'N/A';
                          })()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Box>
              ))}

              {/* Weighted Scores Table */}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 'bold', color: '#ffffff', bgcolor: '#f5c242', p: 1, borderRadius: 1 }}>
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
                      const { rows, grandTotal } = computeWeightedScores(selectedResult.form.sections);
                      return (
                        <>
                          {rows.map(row => (
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
                              {grandTotal.toFixed(2)} %
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })()}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          </>
        )}
        {/* Only show this if there are results but no selection */}
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