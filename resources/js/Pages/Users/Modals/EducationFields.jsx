import React, { useState, useEffect } from 'react';
import { Box, Button, IconButton, Dialog, DialogTitle, DialogContent, Grid, TextField, Typography,
     CircularProgress, FormGroup, FormControl, InputLabel, FormControlLabel, Switch, Select, MenuItem, Avatar, Stack, Tooltip, Divider } from '@mui/material';
import { CgAdd } from "react-icons/cg";  


function EducationFields({education}){
    const [fields, setFields] = useState(education.length > 0 ? education.length: 1);
    const handleAddField = () => {
        setFields(count => count + 1);
    };
    const degreeList = ["Bachelor", "Masteral", "Doctoral"]

    const [educationFields, setEducationFields] = useState(
        education.length > 0 ? education : [{ degree: "", school: "", year: "" }]
    );
    return(
        <Grid container spacing={2} size={12} sx={{ maxHeight: 300, overflow: "auto" }}>
            {[...Array(fields)].map((_, index) => (
            <Grid container spacing={2} key={index} alignItems="center">
                <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                        <TextField label="School Name" />
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <Select
                            labelId="degree-select-label"
                            id="degree-select"
                            value={education[index].degree ?? degreeList[0]}
                            label="Degree"
                            onChange={(event) => {education[index].degree = event.target.value; console.log(event.target.value)}}
                        >
                            {degreeList.map((deg, index) => (
                                <MenuItem key={index} value={deg}>{deg}</MenuItem>
                            ))}
                        </Select>
                        {/* <Select
                            labelId="degree-select-label"
                            id="degree-select"
                            value={education[index].degree ?? degreeList[0]}
                            label="Degree"
                            onChange={(event) => education[index].degree = )}
                        >
                            {degree.map((deg, index) => (
                            <MenuItem key={index} value={deg}>
                                {deg}
                            </MenuItem>
                            ))}
                        </Select> */}
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                        <TextField label="Year Graduated" />
                    </FormControl>
                </Grid>
                {index === fields -1 && (
                <Grid item xs={12} md={2}>
                    <Button onClick={handleAddField} variant="text" startIcon={<CgAdd/>}>
                        Add Field
                    </Button>
                </Grid>
                )}
            </Grid>
            ))}      
        </Grid>
    );
}
export default EducationFields;