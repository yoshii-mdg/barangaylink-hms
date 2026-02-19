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
      text: 'Households per Purok/Zone',
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
      max: 225,
      ticks: {
        stepSize: 75,
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
  labels: ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'],
  datasets: [
    {
      data: [130, 155, 120, 140, 110, 157],
      backgroundColor: '#86efac',
      borderColor: '#22c55e',
      borderWidth: 1,
    },
  ],
};

export default function HouseholdsPerPurok() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'bar',
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
