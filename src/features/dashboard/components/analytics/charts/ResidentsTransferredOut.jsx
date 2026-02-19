import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const barLabelsPlugin = {
  id: 'barLabels',
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((dataset, i) => {
      const meta = chart.getDatasetMeta(i);
      meta.data.forEach((bar, idx) => {
        const value = dataset.data[idx];
        if (value == null) return;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.fillText(String(value), bar.x, bar.y - 6);
        ctx.restore();
      });
    });
  },
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: {
      display: true,
      text: 'Residents Transferred Out',
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
      max: 240,
      ticks: { stepSize: 80, color: '#6b7280', font: { size: 12 } },
      grid: { color: '#f3f4f6' },
    },
  },
};

const data = {
  labels: ['2021', '2022', '2023', '2024', '2025'],
  datasets: [
    {
      data: [80, 92, 100, 110, 95],
      backgroundColor: '#86efac',
      borderColor: '#22c55e',
      borderWidth: 1,
    },
  ],
};

export default function ResidentsTransferredOut() {
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
      plugins: [barLabelsPlugin],
    });
    return () => chartRef.current?.destroy();
  }, []);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}
