import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const PemeOverview = ({ records }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        // Group by date
        const dateCounts = records.reduce((acc, record) => {
            acc[record.name] = (acc[record.name] || 0) + 1;
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
                                size: 14,
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
        <div className="p-1 max-w-xl mx-auto">
            <h6 className="text-lg mb-50 text-left">
                Employee Respondents per Exam
            </h6>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default PemeOverview;
