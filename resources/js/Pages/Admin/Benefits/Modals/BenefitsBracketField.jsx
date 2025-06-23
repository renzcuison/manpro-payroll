import React from 'react';
import { Box, Button, Grid, TextField, Typography, FormControl, InputAdornment, TableContainer, Table,
TableHead, TableBody, TableRow, TableCell, Tooltip} from '@mui/material';
import { CgAdd, CgTrash } from "react-icons/cg";  

const BenefitsBracketField = ({type, bracketsList, onAdd, onChange, onRemove, bracketListErrors}) => {
    return (
        <Box width="100%" sx={{mb:3}}>  
            <Box display="flex">
                <Typography variant="h5" sx={{ marginLeft: { xs: 0, md: 1 }, marginRight:{xs:1, md:2}, fontWeight: 'bold' }}> Benefits Bracket List </Typography>
            </Box>

            <TableContainer>
                <Table stickyHeader size='small'>
                    <TableHead>
                        <TableRow>
                            <TableCell>Range Start</TableCell>
                            <TableCell>Range End</TableCell>
                            <TableCell>Employer's Share</TableCell>
                            <TableCell>Employee's Share</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bracketsList.length > 0 && bracketsList.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        error={bracketListErrors[index]}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                            readOnly: true,
                                            
                                        }}
                                        value={item.range_start}
                                        onChange={(e) => onChange(index, 'range_start', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        variant="outlined"
                                        error={bracketListErrors[index]}
                                        placeholder={index === bracketsList.length - 1 ? 'and above' : ''}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                                            readOnly: index === bracketsList.length - 1,

                                        }}
                                        value={item.range_end || ''}
                                        onChange={(e) => onChange(index, 'range_end', e.target.value)}
                                    />
                                </TableCell>

                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                                    <TextField size='small' variant="outlined" error={bracketListErrors[index]}
                                    InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">{type === "Bracket Amount" ? "₱": "%"}</InputAdornment>
                                        ),
                                    }}
                                    value={item.employer_share} onChange={(e)=>onChange(index, "employer_share", e.target.value)} />
                                </TableCell>
                                <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                                    <TextField size='small' variant="outlined" error={bracketListErrors[index]}
                                    InputProps={{
                                        startAdornment: (
                                          <InputAdornment position="start">{type === "Bracket Amount" ? "₱": "%"}</InputAdornment>
                                        ),
                                    }}
                                    value={item.employee_share} onChange={(e)=>onChange(index, "employee_share", e.target.value)} />
                                </TableCell>
                                <TableCell>
                                    <Button onClick={() => onRemove(index)} variant="text" startIcon={<CgTrash style={{ color: 'red' }} />}/> 
                                </TableCell>
                            </TableRow> 
                        ))}
                        <TableRow>
                            <TableCell colSpan={5} align='center'>
                                <Button onClick={onAdd} variant="text" startIcon={<CgAdd/>}>Add New Bracket</Button>
                            </TableCell>
                        </TableRow>
                        
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default BenefitsBracketField;