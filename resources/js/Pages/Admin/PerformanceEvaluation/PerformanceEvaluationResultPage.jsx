import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Paper, Table, TableHead, TableBody, TableRow, TableCell, Divider, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import Layout from '../../../components/Layout/Layout';
import { getFullName } from '../../../utils/user-utils';

const PerformanceEvaluationResultPage = () => {
  const storedUser = localStorage.getItem("nasya_user");
  const user = JSON.parse(storedUser);
  const headers = getJWTHeader(user);

  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch completed evaluations where user is Evaluatee
  useEffect(() => {
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
        }
      })
      .catch(() => setResults([]));
  }, []);

  // Fetch detail of selected evaluation
  useEffect(() => {
    if (!selectedResultId) return setSelectedResult(null);
    setLoading(true);
    axiosInstance.get('/getEvaluationResponse', {
      headers,
      params: { id: selectedResultId },
    })
      .then(res => setSelectedResult(res.data.evaluationResponse))
      .catch(() => setSelectedResult(null))
      .finally(() => setLoading(false));
  }, [selectedResultId]);

  // Utility: Compute section weights from section.score
  function getSectionWeights(sections) {
    const totalScore = sections.reduce((sum, sec) => sum + (Number(sec.score) || 0), 0);
    return sections.reduce((acc, sec) => {
      acc[sec.id] = totalScore > 0 ? (Number(sec.score) || 0) / totalScore : 0;
      return acc;
    }, {});
  }

  // Compute section average as mean of subcategory percentages
  function computeSectionAverage(section) {
    const validSubcats = section.subcategories.filter(
      sub => sub.score && sub.score > 0
    );
    if (validSubcats.length === 0) return null;
    const avg =
      validSubcats.reduce(
        (sum, sub) =>
          sum + Math.min(1, +(sub.achieved_score || 0) / (sub.score || 1)), // cap at 100%
        0
      ) / validSubcats.length;
    return avg * 100;
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
      <Box sx={{ mt: 4, p: 4, bgcolor: 'white', borderRadius: 2, maxWidth: '900px', mx: 'auto', boxShadow: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Performance Evaluation Result</Typography>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && selectedResult && (
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
                  <Typography sx={{ fontWeight: 'bold', color: '#c99a14', bgcolor: '#f5c242', p: 1, borderRadius: 1 }}>
                    Overall Rating - {section.name}
                  </Typography>
                  <Table size="small" sx={{ my: 1 }}>
                    <TableBody>
                      {section.subcategories.map(subcat => (
                        <TableRow key={subcat.id}>
                          <TableCell>{subcat.name}</TableCell>
                          <TableCell align="right">
                            {subcat.score && subcat.score > 0
                              ? `${((subcat.achieved_score || 0) / subcat.score * 100).toFixed(1)} %`
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
                <Typography sx={{ fontWeight: 'bold', color: '#c99a14', bgcolor: '#f5c242', p: 1, borderRadius: 1 }}>
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
        {!loading && !selectedResultId && (
          <Typography variant="body1" color="gray" sx={{ mt: 4 }}>
            Select a result above to view your evaluation.
          </Typography>
        )}
      </Box>
    </Layout>
  );
};

export default PerformanceEvaluationResultPage;