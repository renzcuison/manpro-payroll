import React from 'react'
import {
    Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VerticalBarGraph = ({Title, titlePosition, labels, datasets, height}) => {

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: Title,
                position: titlePosition,
            },
        },
        scales: {
            x: {
              grid: {
                display: false
              }
            },
            // y: {
            //   grid: {
            //     display: false
            //   }
            // }
          }
    };

    const data = {
        labels,
        datasets,
    };

    return (
        <Bar options={options} data={data} style={{ height: height }} />
    )
}

export default VerticalBarGraph