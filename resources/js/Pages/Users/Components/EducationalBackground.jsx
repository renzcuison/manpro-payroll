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
                    
                    <Grid container size={6}>
                        <Grid size={12}>
                            <Typography sx={{color:"gray", fontWeight:"bold"}}>
                                {item.degree_type} ({item.degree_name})
                            </Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography sx={{fontWeight:"bold", fontSize:16}}>
                                {item.school_name}
                            </Typography>
                        </Grid>

                    </Grid>
                    {/*<--Right Side-->*/}
                    <Grid container size={6}>  
                        <Grid size={12}>
                            <Typography sx={{fontWeight:"bold", fontSize:16, alignItems:"center"}}>
                                {item.year_graduated}
                            </Typography>
                        </Grid> 
                        <Grid size={12}>
                            <Typography sx={{color:"gray"}}>
                                Year Graduated
                            </Typography>
                        </Grid>
                        
                    </Grid>

                    {index !== education.length -1 && (<Grid size={12} sx={{mt:2}}>
                        <Divider></Divider>
                    </Grid>)}
                </Grid>
            ))
            ):(
            <Typography alignContent="center">No Educational Backgrounds</Typography>)
            }

        </Box>
    )
}
export default EducationalBackground;