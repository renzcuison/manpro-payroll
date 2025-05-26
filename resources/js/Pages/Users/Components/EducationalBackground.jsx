import React, { useState, useEffect, useRef } from 'react';
import axiosInstance, { getJWTHeader } from '../../../utils/axiosConfig';
import { Avatar, Box, Grid, Paper, Stack, Typography, Tooltip, Button, Divider } from "@mui/material";

const EducationalBackground = () => {
    const storedUser = localStorage.getItem("nasya_user");
    const headers = getJWTHeader(JSON.parse(storedUser));
    useEffect(() => {
        axiosInstance.get(`/employee/getEducationBackground`, { headers })
            .then((response) => {
                if (response.data.status === 200) {
                    
                    const educationBackgrounds = response.data.educations
                    setEducation(educationBackgrounds);   
                    
                }
            })
            .catch((error) => {
                console.error("Error fetching education backgroun:", error);
                setEducation(null);
            });
    }, []);
    const [education, setEducation] = useState([]);
    
    return(
        <Box component={Paper} sx={{ my: 4, p: 4, borderRadius: 5 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                {" "}Educational Background{" "}
            </Typography>

        </Box>
    )
}
export default EducationalBackground;