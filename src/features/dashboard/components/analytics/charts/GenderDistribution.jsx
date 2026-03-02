import { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const options = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#374151', font: { size: 12 }, usePointStyle: true, pointStyle: 'circle' },
    },
    title: {
      display: true,
      text: 'Gender Distribution',
      font: { size: 16, weight: '600' },
      color: '#111827',
    },
  },
};

export default function GenderDistribution({ data = [], loading = false }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (loading || !canvasRef.current || data.length === 0) return;
    const ctx = canvasRef.current.getContext('2d');
    if (chartRef.current) chartRef.current.destroy();

    const labels = data.map((d) => d.gender);
    const counts = data.map((d) => Number(d.count));

    chartRef.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#22c55e', '#86efac'],
          borderColor: ['#22c55e', '#86efac'],
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options,
    });
    return () => chartRef.current?.destroy();
  }, [data, loading]);

  if (loading) return <div className="h-[280px] w-full bg-gray-100 rounded animate-pulse" />;
  if (data.length === 0) return <div className="h-[280px] w-full flex items-center justify-center text-gray-400 text-sm">No gender data available.</div>;

  return <div className="h-[280px] w-full relative"><canvas ref={canvasRef} /></div>;
}