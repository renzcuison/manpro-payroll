// EmployeeBarChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BranchesChart = ({ data }) => {
    // Transform data into chart-friendly format
    const departmentNames = data.map((dep) => dep.branch);
    const employeeCounts = data.map((dep) => dep.users.length);

    const chartData = {
        labels: departmentNames,
        datasets: [
            {
                label: "Employees per Department",
                data: employeeCounts,
                backgroundColor: "rgb(233, 171, 19,0.7)",
                borderColor: "rgb(233, 171, 19,0.7)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                bodyFont: { size: 10 },
                titleFont: { size: 10 },
            },
        },
        scales: {
            x: {
                ticks: { font: { size: 10 } },
                title: { display: false },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: { font: { size: 12 } },
                title: { display: false },
            },
        },
    };

    return (
        <div style={{ width: "100%", height: "200px" }}>
            {" "}
            {/* ⬅ Adjust size here */}
            <Bar data={chartData} options={chartOptions} />
        </div>
    );
};

export default BranchesChart;
