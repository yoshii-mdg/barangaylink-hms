import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#374151',
        font: { size: 12 },
        usePointStyle: true,
        pointStyle: 'circle',
      },
    },
    title: {
      display: true,
      text: 'Gender Distribution',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
};

const data = {
  labels: ['Male', 'Female'],
  datasets: [
    {
      data: [49.6, 50.4],
      backgroundColor: ['#22c55e', '#86efac'],
      borderColor: ['#22c55e', '#86efac'],
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
};

export default function GenderDistribution() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
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
