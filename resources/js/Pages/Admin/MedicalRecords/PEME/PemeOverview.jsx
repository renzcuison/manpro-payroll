import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import { Padding } from "@mui/icons-material";
import {
    Box,
    Button,
    Typography,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    TextField,
    CircularProgress,
} from "@mui/material";
const PemeOverview = ({ records }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Group by exam name
        const dateCounts = records.reduce((acc, record) => {
            acc[record.name] = acc[record.name] || record.respondents;
            return acc;
        }, {});

        const data = {
            labels: Object.keys(dateCounts),
            datasets: [
                {
                    label: "Employee Respondents",
                    data: Object.values(dateCounts),
                },
            ],
        };

        const config = {
            type: "pie",
            data,
            options: {
                responsive: true,
                layout: {
                    padding: {
                        bottom: 20,
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 30,
                            font: {
                                size: 12,
                            },
                        },
                    },
                    tooltip: {
                        enabled: true,
                    },
                },
            },
        };

        const chart = new Chart(canvasRef.current, config);

        return () => chart.destroy();
    }, [records]);

    return (
        <Box>
            <h6>Exam Respondents</h6>
            <Box sx={{ mt: 4, mb: -2}}>
                <canvas ref={canvasRef}></canvas>
            </Box>
        </Box>
    );
};


export default PemeOverview;
