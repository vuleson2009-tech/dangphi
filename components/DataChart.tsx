import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { SheetRow } from '../types';
import { PieChart as PieChartIcon, BarChart3, LineChart as LineChartIcon, Palette, ChevronDown } from 'lucide-react';

interface DataChartProps {
  data: SheetRow[];
}

type ChartType = 'bar' | 'pie' | 'line';
type PaletteName = 'default' | 'pastel' | 'ocean' | 'warm' | 'neon';

const PALETTES: Record<PaletteName, { label: string; colors: string[] }> = {
  default: {
    label: 'Mặc định',
    colors: ['#4f46e5', '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
  },
  pastel: {
    label: 'Pastel',
    colors: ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA']
  },
  ocean: {
    label: 'Đại dương',
    colors: ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00']
  },
  warm: {
    label: 'Nóng ấm',
    colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#d62828']
  },
  neon: {
    label: 'Neon',
    colors: ['#f72585', '#7209b7', '#3a0ca3', '#4361ee', '#4cc9f0', '#f72585']
  }
};

const DataChart: React.FC<DataChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [palette, setPalette] = useState<PaletteName>('default');
  const [showPaletteMenu, setShowPaletteMenu] = useState(false);

  const chartData = useMemo(() => {
    // Aggregate data: Sum 'amount' by 'category'
    const aggregation: Record<string, number> = {};

    data.forEach((row) => {
      // Robustly handle amount parsing (remove non-numeric chars except dot/minus)
      const rawAmount = row['amount'];
      let amount = 0;
      if (typeof rawAmount === 'number') {
        amount = rawAmount;
      } else if (typeof rawAmount === 'string') {
        amount = parseFloat(rawAmount.replace(/[^0-9.-]+/g, '')) || 0;
      }

      // Filter out negative or zero amounts for Pie charts to avoid rendering issues
      if (amount <= 0 && chartType === 'pie') return;

      const category = String(row['category'] || 'Chưa phân loại').trim();
      
      if (category) {
        aggregation[category] = (aggregation[category] || 0) + amount;
      }
    });

    return Object.entries(aggregation)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value); // Sort descending
  }, [data, chartType]);

  if (chartData.length === 0) {
    return null;
  }

  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const activeColors = PALETTES[palette].colors;

  const renderContent = () => {
    switch (chartType) {
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Tổng tiền']} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number) => [formatCurrency(value), 'Tổng tiền']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                name="Tổng tiền" 
                stroke={activeColors[0]} 
                strokeWidth={3} 
                dot={{ r: 6, fill: activeColors[0], strokeWidth: 2, stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${value / 1000}k`} tickLine={false} axisLine={false} />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Tổng tiền']}
                cursor={{ fill: '#f1f5f9' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="value" name="Tổng tiền" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={activeColors[index % activeColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Thống kê theo Phân loại</h3>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {/* Chart Type Toggles */}
          <div className="flex bg-white rounded-md shadow-sm">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-l-md transition-all ${
                chartType === 'bar' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Biểu đồ cột"
            >
              <BarChart3 size={18} />
            </button>
            <div className="w-px bg-slate-100"></div>
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 transition-all ${
                chartType === 'pie' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Biểu đồ tròn"
            >
              <PieChartIcon size={18} />
            </button>
            <div className="w-px bg-slate-100"></div>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-r-md transition-all ${
                chartType === 'line' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Biểu đồ đường"
            >
              <LineChartIcon size={18} />
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 mx-1"></div>

          {/* Palette Selector */}
          <div className="relative">
            <button
              onClick={() => setShowPaletteMenu(!showPaletteMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-600 rounded-md text-sm font-medium transition-colors outline-none"
            >
              <Palette size={16} className="text-slate-400" />
              <span className="hidden sm:inline">{PALETTES[palette].label}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </button>

            {showPaletteMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowPaletteMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {(Object.keys(PALETTES) as PaletteName[]).map((pKey) => (
                    <button
                      key={pKey}
                      onClick={() => {
                        setPalette(pKey);
                        setShowPaletteMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${
                        palette === pKey ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex gap-0.5">
                        {PALETTES[pKey].colors.slice(0, 3).map((c, i) => (
                          <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                      {PALETTES[pKey].label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default DataChart;