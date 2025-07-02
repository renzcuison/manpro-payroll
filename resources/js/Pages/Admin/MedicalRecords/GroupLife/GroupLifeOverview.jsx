import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";

const GroupLifeOverview = ({ records }) => {
    const canvasRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const lastRecordHashRef = useRef(null);

    const generateDataHash = (records) =>
    records.map(r => `${r.groupLifeName}-${r.planType}-${r.employeesAssignedCount || 0}`).sort().join(",");

    useEffect(() => {

        const context = canvasRef.current;
        if (!context) return;

        const currentHash = generateDataHash(records);
        if (lastRecordHashRef.current === currentHash) return;

        lastRecordHashRef.current = currentHash;

        const counts = records.reduce((acc, rec) => {
            const label = `${rec.groupLifeName} - ${rec.planType}`;
            acc[label] = (acc[label] || 0) + (rec.employeesAssignedCount || 0);;
            return acc;
        }, {});

        const data = {
            labels: Object.keys(counts),
            datasets: [
                {
                    label: "Employee Respondents",
                    data: Object.values(counts),
                },
            ],
        };

        if (chartInstanceRef.current) {
            chartInstanceRef.current.data = data;
            chartInstanceRef.current.update();
        } 
        
        else {
            chartInstanceRef.current = new Chart(context, {
                type: "pie",
                data,
                options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        align: "start",
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
            });
        }

        return () => {
        };
    }, [records]);

    return (
        <div className="p-1 max-w-xl mx-auto">
            <h6 className="text-lg mb-50 text-left">Employees per Group Life</h6>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
};

export default GroupLifeOverview;