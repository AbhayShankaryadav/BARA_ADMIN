import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import apiClient from '../api/apiClient';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SalesChart = ({ darkTheme = false }) => {
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData(period);
  }, [period]);

  const fetchChartData = async (currentPeriod) => {
    try {
      setLoading(true);
      const data = await apiClient.getSalesChart(currentPeriod);
      if (Array.isArray(data) && data.length > 0) {
        setChartData({
          labels: data.map(row => row.date),
          datasets: [{
            label: 'Revenue (₹)',
            data: data.map(row => row.total),
            borderColor: darkTheme ? '#a78bfa' : '#3b82f6',
            backgroundColor: darkTheme ? 'rgba(167, 139, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: darkTheme ? '#a78bfa' : '#3b82f6',
            pointBorderColor: darkTheme ? '#1f2937' : '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 8
          }]
        });
      } else {
        // If data is empty, set chartData to null to show a message
        setChartData(null);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData({
        labels: [],
        datasets: [{
          label: 'Revenue (₹)',
          data: [],
          borderColor: darkTheme ? '#a78bfa' : '#3b82f6',
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: darkTheme ? '#9ca3af' : '#6b7280',
          font: { size: 12, weight: 'bold' },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: darkTheme ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: darkTheme ? '#fff' : '#000',
        bodyColor: darkTheme ? '#d1d5db' : '#374151',
        borderColor: darkTheme ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        callbacks: {
          label: function(context) {
            return '₹ ' + context.parsed.y.toLocaleString();
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: darkTheme ? '#9ca3af' : '#6b7280',
          font: { size: 11 },
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: darkTheme ? 'rgba(107, 114, 128, 0.1)' : 'rgba(229, 231, 235, 0.5)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: darkTheme ? '#9ca3af' : '#6b7280',
          font: { size: 11 }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-zinc-400">Loading chart...</p>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">No sales data available for the last 7 days.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <div className="flex items-center bg-[#0f0f12] border border-zinc-800 rounded-lg p-1">
          {['1d', '7d', '30d', '3m', '1y'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="h-full">
        {chartData ? (
          <Line data={chartData} options={options} />
        ) : <div className="h-64 flex items-center justify-center"><p className="text-xs uppercase tracking-widest text-zinc-500">No sales data for this period.</p></div>}
      </div>
    </div>
  );
};

export default SalesChart;