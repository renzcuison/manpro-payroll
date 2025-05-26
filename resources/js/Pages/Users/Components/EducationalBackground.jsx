import React, { useState, useEffect, useRef } from 'react';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Avatar, Box, Grid, Paper, Stack, Typography, Tooltip, Button, Divider } from "@mui/material";

const EducationalBackground = ({education}) => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    
    return(
        <Box component={Paper} sx={{ my: 4, p: 4, borderRadius: 5,  overflow: "auto" }}>
            <Typography variant="h5" sx={{ mb: 4, fontWeight: "bold" }}>
                {" "}Educational Background{" "}
            </Typography>

            {education.length > 0 ? (
                education.map((item, index) => (
                <Grid container size={12} sx={{mt:2}} key={index}>
                    {/*<--Left Side-->*/}
                    
                    <Grid container size={8}>
                        <Grid size={12}>
                            <Typography sx={{fontWeight:"bold", fontSize:16, alignItems:"center"}}>
                                {item.degree_name}
                            </Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography sx={{color:"gray"}}>
                                {item.school_name}
                            </Typography>
                        </Grid>

                    </Grid>
                    {/*<--Right Side-->*/}
                    <Grid container size={4}>  
                        <Grid size={12}>
                            <Typography sx={{fontWeight:"bold", fontSize:16, alignItems:"center"}}>
                                {item.degree_type} 
                            </Typography>
                        </Grid> 
                        <Grid size={12}>
                            <Typography sx={{color:"gray"}}>
                                {item.year_graduated}
                            </Typography>
                        </Grid>
                        
                    </Grid>

                    {index !== education.length -1 && (<Grid size={12} sx={{mt:2}}>
                        <Divider></Divider>
                    </Grid>)}
                </Grid>
            ))
                ):(
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="30px">
                        <Typography>No Educational Backgrounds</Typography>
                    </Box>
                )
            }

        </Box>
    )
}
export default EducationalBackground;