import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Predefined colors for a consistent look
const PIE_CHART_COLORS = [
  '#EF4444', '#F97316', '#22C55E', '#3B82F6', '#8B5CF6',
  '#14B8A6', '#EC4899', '#FBBF24', '#6366F1', '#A855F7'
];

interface PieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
    }[];
  };
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
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
          type: 'pie',
          data: {
            labels: data.labels,
            datasets: data.datasets.map(ds => ({
                data: ds.data,
                backgroundColor: PIE_CHART_COLORS,
                hoverOffset: 4,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                }
            },
          },
        });
      }
    }
    
    return () => {
        if(chartInstance.current) {
            chartInstance.current.destroy();
        }
    }
  }, [data]);

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default PieChart;