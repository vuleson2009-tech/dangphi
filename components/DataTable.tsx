import React, { useState } from 'react';
import { ColumnDefinition, SheetRow } from '../types';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';

interface DataTableProps {
  columns: ColumnDefinition[];
  data: SheetRow[];
  onDeleteRow: (index: number) => void;
  onUpdateRow: (index: number, key: string, value: string) => void;
  onAddRow: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, onDeleteRow, onUpdateRow, onAddRow }) => {
  const [rowToDelete, setRowToDelete] = useState<number | null>(null);

  const handleDeleteClick = (index: number) => {
    setRowToDelete(index);
  };

  const confirmDelete = () => {
    if (rowToDelete !== null) {
      onDeleteRow(rowToDelete);
      setRowToDelete(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">#</th>
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-3 whitespace-nowrap min-w-[120px]">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                 <tr>
                   <td colSpan={columns.length + 2} className="py-12 text-center text-slate-400 border-dashed">
                     Chưa có dữ liệu. Nhập văn bản hoặc nhấn "Thêm dòng" để bắt đầu.
                   </td>
                 </tr>
              ) : (
                data.map((row, rowIndex) => {
                  // If the row has a specific original index (from filtering), use it. Otherwise use the current display index.
                  const actionIndex = (row as any)._originalIndex ?? rowIndex;
                  
                  return (
                    <tr key={rowIndex} className="group even:bg-slate-50/50 hover:bg-indigo-50/60 transition-colors">
                      <td className="px-4 py-2 text-center text-slate-400 text-xs">{rowIndex + 1}</td>
                      {columns.map((col) => (
                        <td key={col.id} className="p-0 border-l border-transparent hover:border-slate-200">
                          <input
                            type={col.type === 'number' || col.type === 'currency' ? 'number' : 'text'}
                            value={row[col.id] || ''}
                            onChange={(e) => onUpdateRow(actionIndex, col.id, e.target.value)}
                            className="w-full h-full px-4 py-3 bg-transparent outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:ring-inset text-slate-700 placeholder-slate-300"
                            placeholder={`...`}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => handleDeleteClick(actionIndex)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                          tabIndex={-1}
                          title="Xóa dòng"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer Actions for Table */}
        <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-center">
          <button 
            onClick={onAddRow}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all w-full justify-center sm:w-auto"
          >
            <Plus size={16} /> Thêm dòng trống
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {rowToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Xác nhận xóa</h3>
            </div>
            
            <p className="text-slate-600 mb-6 leading-relaxed">
              Bạn có chắc chắn muốn xóa dòng dữ liệu này không? Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DataTable;