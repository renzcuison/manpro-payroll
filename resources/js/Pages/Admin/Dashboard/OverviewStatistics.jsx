import React, { useState } from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend
);

function OverviewStatistics() {
    const [value, setValue] = useState("overtime");

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sept",
        "Oct",
        "Nov",
        "Dec",
    ];

    const generateChartData = (label, color) => {
        const data = months.map((month, i) =>
            i < 5 ? Math.floor(Math.random() * 100) + 50 : 0
        );

        return {
            labels: months,
            datasets: [
                {
                    label,
                    data,
                    fill: true,
                    tension: 0.4,
                    borderColor: color,
                    backgroundColor: `${color}33`, // light transparent fill
                    pointBackgroundColor: color,
                },
            ],
        };
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 5 }}>
            <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: "#4d4d4d", mb: 2 }}
            >
                Overview Statistics
            </Typography>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ mb: 3 }}
            >
                <Tab value="payroll" label="Payroll" />
                <Tab value="benefits" label="Benefits" />
                <Tab value="overtime" label="Overtime Cost" />
                <Tab value="turnover" label="Turnover Rate" />
                <Tab value="attendance" label="Attendance" />
                <Tab value="milestone" label="Milestone" />
            </Tabs>
            <Box sx={{ height: 300 }}>
                <Line
                    data={
                        value === "payroll"
                            ? generateChartData("Payroll", "#1976d2")
                            : value === "benefits"
                            ? generateChartData("Benefits", "#9c27b0")
                            : value === "overtime"
                            ? generateChartData("Overtime Cost", "#2e7d32")
                            : value === "turnover"
                            ? generateChartData("Turnover Rate", "#ef6c00")
                            : value === "attendance"
                            ? generateChartData("Attendance", "#0288d1")
                            : generateChartData("Milestone", "#6d4c41")
                    }
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false, // Hide legend for compact display
                            },
                            tooltip: {
                                mode: "index",
                                intersect: false,
                            },
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    font: {
                                        size: 10,
                                    },
                                },
                                grid: {
                                    display: false,
                                },
                            },
                            x: {
                                ticks: {
                                    font: {
                                        size: 10,
                                    },
                                },
                                grid: {
                                    display: false,
                                },
                            },
                        },
                    }}
                    height={150} // Reduced height
                />
            </Box>
        </Paper>
    );
}

export default OverviewStatistics;
