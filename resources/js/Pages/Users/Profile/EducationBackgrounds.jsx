import { Avatar, Box, Grid, Paper, Stack, Typography, Tooltip, Button} from "@mui/material";
import moment from "moment";
import React, { useState, useEffect, useRef} from 'react';
import Swal from 'sweetalert2';
import axiosInstance, { getJWTHeader }  from "../../../utils/axiosConfig";
import dayjs from "dayjs";
import { useQueryClient } from '@tanstack/react-query';
import EditIcon from "@mui/icons-material/Edit";

const EducationBackground = ({education}) => {
    return(
        education.length > 0 ?
        education.map((val, index) =>(
            <Grid container size={12}>
                <Grid container item md={6}>
                    <Grid item md={12}>
                        <Typography>{education[index].degree}</Typography>
                    </Grid>
                    <Grid item md={12}>
                        <Typography>{education[index].school}</Typography>
                    </Grid>
                </Grid>
                <Grid container item md={6}>
                <Grid item md={12}>
                    <Typography>Year Graduated</Typography>
                </Grid>
                <Grid item md={12}>
                    <Typography>{education[index].year}</Typography>
                </Grid>
                </Grid>
            </Grid>
        )):
        (<Typography>No Educational Background Found</Typography>)
    );
}
export default EducationBackground