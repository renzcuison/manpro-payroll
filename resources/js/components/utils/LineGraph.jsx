import React from 'react'
import {
    Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineGraph = ({Title, titlePosition, labels, datasets, height}) => {

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
        <Line options={options} data={data} style={{ height: height }} />
    )
}

export default LineGraph