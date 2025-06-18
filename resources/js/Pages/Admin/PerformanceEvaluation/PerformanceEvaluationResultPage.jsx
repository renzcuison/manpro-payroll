import React from "react";
import { useParams } from "react-router-dom";
import { useEvaluationResponse } from "../../../hooks/useEvaluationResponse";
import { Box, CircularProgress, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

const getSectionScore = (section) => {
  if (!section || !section.subcategories) return { sectionScore: 0, subcatScores: [] };
  let scoreTotal = 0;
  let counted = 0;
  const subcatScores = [];

  section.subcategories.forEach(subcat => {
    let subScore = 0;
    if (subcat.subcategory_type === 'multiple_choice') {
      const selected = subcat.options.find(opt => opt.option_answer);
      if (selected) subScore = Number(selected.score) || 0;
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    } else if (subcat.subcategory_type === 'checkbox') {
      const selected = subcat.options.filter(opt => opt.option_answer);
      const selectedSum = selected.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      const allSum = subcat.options.reduce((sum, o) => sum + (Number(o.score) || 1), 0);
      if (allSum > 0) subScore = (selectedSum / allSum) * 100;
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    } else if (subcat.subcategory_type === 'linear_scale') {
      if (subcat.percentage_answer && typeof subcat.percentage_answer.value === 'number') {
        const start = Number(subcat.linear_scale_start) || 1;
        const end = Number(subcat.linear_scale_end) || 5;
        const value = Number(subcat.percentage_answer.value);
        if (end > start) subScore = ((value - start) / (end - start)) * 100;
      }
      subcatScores.push({ id: subcat.id, name: subcat.name, score: subScore, description: subcat.description });
      scoreTotal += subScore;
      counted++;
    }
  });

  const sectionScore = counted > 0 ? scoreTotal / counted : 0;
  return { sectionScore, subcatScores };
};

const PerformanceEvaluationResultPage = () => {
  const { id } = useParams();
  const { evaluationResponse, loading, error } = useEvaluationResponse(id);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="error">Error loading evaluation data.</Typography>
      </Box>
    );
  }

  if (!evaluationResponse || !evaluationResponse.form) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography color="error">Evaluation data not found.</Typography>
      </Box>
    );
  }

  const { form } = evaluationResponse;
  let tableRows = [];
  let totalSum = 0, totalCount = 0;

  form.sections.forEach(section => {
    const { sectionScore, subcatScores } = getSectionScore(section);
    if (subcatScores.length === 0) {
      tableRows.push({
        section: section.name,
        category: section.category || "",
        subcategory: <i>No subcategories</i>,
        rate: "-",
        sectionScore: null,
      });
    } else {
      subcatScores.forEach(subcat => {
        tableRows.push({
          section: section.name,
          category: section.category || "",
          subcategory: subcat.name,
          rate: subcat.score,
        });
        totalSum += subcat.score;
        totalCount++;
      });
      // Optionally show section subtotal
      tableRows.push({
        section: "",
        category: "",
        subcategory: <b>Section Average</b>,
        rate: Number(sectionScore).toFixed(1),
        isSectionTotal: true
      });
    }
  });

  const totalRate = totalCount > 0 ? totalSum / totalCount : 0;

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto', mt: 5, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        Performance Evaluation Result
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>Section</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>Category</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>SubCategory</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>Rate</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableRows.map((row, idx) => (
            <TableRow key={idx} sx={row.isSectionTotal ? { bgcolor: "#fff9c4" } : {}}>
              <TableCell align="center">{row.section}</TableCell>
              <TableCell align="center">{row.category}</TableCell>
              <TableCell align="center">{row.subcategory}</TableCell>
              <TableCell align="center">{row.rate !== undefined ? row.rate : "-"}</TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>
              Total Rate
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#F8D063' }}>
              {totalRate.toFixed(1)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

export default PerformanceEvaluationResultPage;