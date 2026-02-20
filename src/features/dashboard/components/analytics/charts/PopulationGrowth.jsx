import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Population Growth',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#6b7280', font: { size: 12 } },
    },
    y: {
      beginAtZero: true,
      max: 4200,
      ticks: { stepSize: 700, color: '#6b7280', font: { size: 12 } },
      grid: { color: '#f3f4f6' },
    },
  },
};

const getData = (filters) => {
  const selectedYear = parseInt(filters?.year || new Date().getFullYear(), 10);
  const startYear = selectedYear - 4;
  const labels = Array.from({ length: 5 }, (_, i) => String(startYear + i));
  const baseData = [2950, 3050, 3250, 3450, 3680];
  const yearOffset = selectedYear - 2025;
  const data = baseData.map((val, idx) => Math.max(0, Math.round(val + yearOffset * 120 + idx * 100)));
  
  return {
    labels,
    datasets: [
      {
        data,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.2,
      },
    ],
  };
};

export default function PopulationGrowth({ filters }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    const chartData = getData(filters);
    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options,
    });
    return () => chartRef.current?.destroy();
  }, [filters]);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}
