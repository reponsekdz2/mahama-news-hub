import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface LineChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  title: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartInstance.current) {
        chartInstance.current.destroy();
    }
      
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                label: ds.label,
                data: ds.data,
                borderColor: ds.color,
                backgroundColor: ds.color.replace(')', ', 0.2)'),
                fill: true,
                tension: 0.3,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: title,
                },
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
          },
        });
      }
    }
    
    return () => {
        if(chartInstance.current) {
            chartInstance.current.destroy();
        }
    }
  }, [data, title]);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div style={{ height: '350px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default LineChart;