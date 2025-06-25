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
        const dateCounts = records.reduce((acc, record) => {
            acc[record.name] = acc[record.name] || record.respondents;
            return acc;
        }, {});

        const hasData = Object.keys(dateCounts).length > 0 && Object.values(dateCounts).some(count => count > 0);

        const data = hasData
            ? {
                labels: Object.keys(dateCounts),
                datasets: [
                    {
                        label: "Employee Respondents",
                        data: Object.values(dateCounts),
                    },
                ],
            }
            : {
                labels: ["No Data"],
                datasets: [
                    {
                        label: "Employee Respondents",
                        data: [1],
                        backgroundColor: ["#e0e0e0"],
                    },
                ],
            };

        // ...existing code...
        const config = {
            type: "pie",
            data,
            options: {
                layout: {
                    padding: {
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 20,
                            font: {
                                size: 12,
                            },
                            boxWidth: 20,
                        },
                        fullSize: true,
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
            <Box sx={{ mt: 4, mb: 2 }}>
                <canvas ref={canvasRef} style={{ display: "block" }}></canvas>
            </Box>
        </Box>
    );
};


export default PemeOverview;
