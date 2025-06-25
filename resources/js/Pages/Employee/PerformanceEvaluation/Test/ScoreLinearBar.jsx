import React from 'react';
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

// The gradient must be on the .bar class, not the root!
const ScoreLinearBar = styled(LinearProgress)(({ theme }) => ({
  height: 15,
  borderRadius: 9,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 9,
    background: 'linear-gradient(90deg, #367C2B 0%, #EAB31A 100%)', // Green to yellow
  },
}));

export default ScoreLinearBar;