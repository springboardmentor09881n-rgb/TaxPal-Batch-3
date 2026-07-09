import { ChartConfiguration } from 'chart.js';

export const CHART_COLORS = [
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#10b981',
  '#f97316',
  '#6366f1',
  '#84cc16',
];

export function darkChartOptions(
  overrides: ChartConfiguration['options'] = {},
): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#94a3b8',
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 13, 31, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(59, 130, 246, 0.25)',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(59, 130, 246, 0.08)' },
        border: { color: 'rgba(59, 130, 246, 0.15)' },
      },
      y: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(59, 130, 246, 0.08)' },
        border: { color: 'rgba(59, 130, 246, 0.15)' },
      },
    },
    ...overrides,
  };
}

export function doughnutChartOptions(): ChartConfiguration['options'] {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 13, 31, 0.95)',
        titleColor: '#fff',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(59, 130, 246, 0.25)',
        borderWidth: 1,
        padding: 12,
      },
    },
  } as ChartConfiguration['options'];
}
