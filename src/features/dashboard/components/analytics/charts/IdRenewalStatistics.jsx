import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'ID Renewal Statistics (Last 6 Months)',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
        font: { size: 12 },
      },
    },
    y: {
      beginAtZero: true,
      max: 60,
      ticks: {
        stepSize: 10,
        color: '#6b7280',
        font: { size: 12 },
      },
      grid: {
        color: '#f3f4f6',
      },
    },
  },
};

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [45, 38, 52, 58, 48, 58],
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      borderWidth: 2,
      fill: true,
      pointBackgroundColor: '#22c55e',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6
    },
  ],
};

export default function IdRenewalStatistics() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data,
      options,
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}
