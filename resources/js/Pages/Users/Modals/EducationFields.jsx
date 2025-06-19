import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography,
     CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Avatar, Stack, Tooltip, Divider } from '@mui/material';
import { CgAdd, CgTrash } from "react-icons/cg";  


function EducationFields({educations, handleChange, handleAddFields, handleRemoveFields}){
    return(
        <>
            <Box display="flex">
                <Typography variant="h5" sx={{ marginLeft: { xs: 0, md: 1 }, marginRight:{xs:1, md:2}, fontWeight: 'bold' }}> Educational Background </Typography>
                <Button onClick={handleAddFields} variant="text" startIcon={<CgAdd/>}>Add Field</Button>
            </Box>
            
            <Grid container rowSpacing={{ xs: 3, md: 2 }} size={12}>
                {educations.length > 0 ? educations.map((item, index) => (
                    <Grid container spacing={2} size = {12} key={index} alignItems="center">
                        <Grid size={3}>
                            <FormControl fullWidth>
                                <TextField label="School Name" value={item.school_name} onChange={(e)=>handleChange(index, "school_name", e.target.value)} />
                            </FormControl>
                        </Grid>

                        <Grid size={3}>
                            <FormControl fullWidth>
                                <TextField label="Program Name" value={item.program_name} onChange={(e)=>handleChange(index, "program_name", e.target.value)} />
                            </FormControl>
                        </Grid>

                        <Grid size={3}>
                            <FormControl fullWidth>
                                <TextField select id="education_level" label="Level" value={item.education_level}
                                variant="outlined" onChange={(e) => { handleChange(index, "education_level", e.target.value) }} >
                                    <MenuItem value={"Elementary"}>{"Elementary"}</MenuItem>
                                    <MenuItem value={"High School"}>{"High School"}</MenuItem>
                                    <MenuItem value={"Senior High School"}>{"Senior High School"}</MenuItem>
                                    <MenuItem value={"Associate"}>{"Associate"}</MenuItem>
                                    <MenuItem value={"Bachelor"}>{"Bachelor"}</MenuItem>
                                    <MenuItem value={"Masters"}>{"Masters"}</MenuItem>
                                    <MenuItem value={"Doctoral"}>{"Doctoral"}</MenuItem>
                                </TextField>
                            </FormControl>
                        </Grid>
                        <Grid size={2}>
                            <FormControl fullWidth>
                                <TextField label="Year Graduated" value={item.year_graduated} onChange={(e)=>handleChange(index, "year_graduated", e.target.value)} />
                            </FormControl>
                        </Grid>

                        <Grid size={1}>
                            <Box display="flex" justifyContent="space-between" gap={1}>
                                <Button onClick={() => handleRemoveFields(index)} variant="text" startIcon={<CgTrash style={{ color: 'red' }} />}> </Button>
                            </Box>
                        </Grid>
                    </Grid>
                )): (
                    <Box width='100%' display='flex' justifyContent='center'>
                        <Typography variant='button'> 
                            Add an educational background field
                        </Typography>
                    </Box>
                    )
                }    
            </Grid>
            <Divider sx={{width:'100%'}}/>

        </>
    );
}
export default EducationFields;