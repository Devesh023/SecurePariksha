import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  labels: string[];
  datasets: number[];
}

export const PassFailChart: React.FC<ChartProps> = ({ labels, datasets }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: datasets,
        backgroundColor: [
          'rgba(16, 185, 129, 0.85)', // Success Green
          'rgba(239, 68, 68, 0.85)',  // Destructive Red
        ],
        borderColor: [
          '#10b981',
          '#ef4444',
        ],
        borderWidth: 1.5,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#8e919e',
          font: { family: 'Outfit', size: 11 },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#13131a',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Outfit' },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Doughnut data={data} options={options} />
    </div>
  );
};

export const StudentGrowthChart: React.FC<ChartProps> = ({ labels, datasets }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Total Students',
        data: datasets,
        fill: true,
        backgroundColor: 'rgba(99, 102, 241, 0.1)', // Indigo 500 gradient
        borderColor: '#6366f1',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#0a0a0c',
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13131a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 }, stepSize: 1 },
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Line data={data} options={options} />
    </div>
  );
};

export const ViolationTrendsChart: React.FC<ChartProps> = ({ labels, datasets }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Violations Flagged',
        data: datasets,
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 8,
        barPercentage: 0.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13131a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 }, stepSize: 2 },
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Bar data={data} options={options} />
    </div>
  );
};

export const CategoryPerformanceChart: React.FC<ChartProps> = ({ labels, datasets }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Avg Score (%)',
        data: datasets,
        backgroundColor: 'rgba(99, 102, 241, 0.85)', // Indigo
        borderColor: '#6366f1',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13131a',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        min: 0,
        max: 100,
        ticks: { color: '#8e919e', font: { family: 'Outfit', size: 10 } },
      },
    },
  };

  return (
    <div className="h-64 relative">
      <Bar data={data} options={options} />
    </div>
  );
};
