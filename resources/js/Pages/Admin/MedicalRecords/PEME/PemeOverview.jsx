import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PemeOverview = ({ records }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Group by date
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
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            usePointStyle: true,
                            pointStyle: "circle",
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
        <div>
            <h6>Employee Respondents per Exam</h6>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default PemeOverview;
