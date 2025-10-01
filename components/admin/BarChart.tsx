import React from 'react';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No data available.</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 0);
  const chartHeight = 250;
  const barWidth = 30;
  const barMargin = 15;
  const chartWidth = data.length * (barWidth + barMargin);

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight + 40} className="font-sans">
          <g transform="translate(0, 10)">
            {data.map((d, i) => {
              const barHeight = maxValue > 0 ? (d.value / maxValue) * chartHeight : 0;
              const x = i * (barWidth + barMargin);
              const y = chartHeight - barHeight;

              return (
                <g key={d.label}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    className="fill-current text-accent-500"
                  />
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-current text-gray-800 dark:text-gray-200 font-semibold"
                  >
                    {d.value}
                  </text>
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-current text-gray-500 dark:text-gray-400"
                  >
                    {d.label}
                  </text>
                </g>
              );
            })}
             <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-current text-gray-200 dark:text-gray-600" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default BarChart;
