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
      text: 'New Residents Per Year',
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

const getData = (filters) => {
  const selectedYear = parseInt(filters?.year || new Date().getFullYear(), 10);
  const startYear = selectedYear - 4;
  const labels = Array.from({ length: 5 }, (_, i) => String(startYear + i));
  const baseData = [120, 135, 150, 165, 180];
  const yearOffset = selectedYear - 2025;
  const data = baseData.map((val, idx) => Math.max(0, Math.round(val + yearOffset * 15 + idx * 3)));
  
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: '#86efac',
        borderColor: '#22c55e',
        borderWidth: 1,
      },
    ],
  };
};

export default function NewResidentsPerYear({ filters }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();
    const chartData = getData(filters);
    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options,
      plugins: [barLabelsPlugin],
    });
    return () => chartRef.current?.destroy();
  }, [filters]);

  return (
    <div className="h-[280px] w-full relative">
      <canvas ref={canvasRef} />
    </div>
  );
}
