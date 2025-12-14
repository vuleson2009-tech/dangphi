import React, { useState } from 'react';
import { ColumnDefinition } from '../types';
import { Plus, X, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_COLUMNS } from '../constants';

interface ColumnConfigProps {
  columns: ColumnDefinition[];
  onSave: (newColumns: ColumnDefinition[]) => void;
  onCancel: () => void;
}

const ColumnConfig: React.FC<ColumnConfigProps> = ({ columns, onSave, onCancel }) => {
  const [localColumns, setLocalColumns] = useState<ColumnDefinition[]>([...columns]);

  const handleChange = (index: number, field: keyof ColumnDefinition, value: string) => {
    const updated = [...localColumns];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-generate ID from label if ID is empty or simple update
    if (field === 'label') {
      updated[index].id = value.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    }
    setLocalColumns(updated);
  };

  const handleAddColumn = () => {
    setLocalColumns([...localColumns, { id: `col_${Date.now()}`, label: 'Cột Mới', type: 'text' }]);
  };

  const handleRemoveColumn = (index: number) => {
    setLocalColumns(localColumns.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    setLocalColumns([...DEFAULT_COLUMNS]);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-lg mb-6 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-slate-800">Cấu hình Cột Bảng Tính</h3>
        <button onClick={handleReset} className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600">
          <RotateCcw size={14} /> Khôi phục mặc định
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {localColumns.map((col, index) => (
          <div key={index} className="flex gap-3 items-center">
            <div className="w-8 text-center text-slate-400 text-sm font-mono">{index + 1}</div>
            <input
              type="text"
              value={col.label}
              onChange={(e) => handleChange(index, 'label', e.target.value)}
              className="flex-1 p-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Tên cột"
            />
            <select
              value={col.type}
              onChange={(e) => handleChange(index, 'type', e.target.value as any)}
              className="w-32 p-2 border border-slate-300 rounded-md text-sm bg-slate-50"
            >
              <option value="text">Văn bản</option>
              <option value="number">Số</option>
              <option value="currency">Tiền tệ</option>
              <option value="date">Ngày tháng</option>
            </select>
            <button
              onClick={() => handleRemoveColumn(index)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Xóa cột"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddColumn}
        className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 mb-6"
      >
        <Plus size={16} /> Thêm cột
      </button>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
        >
          Hủy bỏ
        </button>
        <button
          onClick={() => onSave(localColumns)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Save size={16} /> Lưu cấu hình
        </button>
      </div>
    </div>
  );
};

export default ColumnConfig;
