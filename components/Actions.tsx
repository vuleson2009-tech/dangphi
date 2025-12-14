import React, { useState } from 'react';
import { Copy, ExternalLink, Download, Check } from 'lucide-react';
import { ColumnDefinition, SheetRow } from '../types';
import { TARGET_SHEET_URL } from '../constants';

interface ActionsProps {
  data: SheetRow[];
  columns: ColumnDefinition[];
}

const Actions: React.FC<ActionsProps> = ({ data, columns }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Generate TSV for easy pasting into Google Sheets
    const header = columns.map(c => c.label).join('\t');
    const rows = data.map(row => columns.map(col => row[col.id]).join('\t')).join('\n');
    const textToCopy = rows; // Usually users just want the data rows to append

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const openSheet = () => {
    window.open(TARGET_SHEET_URL, '_blank');
  };

  const isDisabled = data.length === 0;

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6 p-6 bg-slate-900 rounded-xl text-white items-center justify-between">
      <div className="text-sm text-slate-300 max-w-md">
        <strong className="text-white block mb-1">Bước tiếp theo:</strong>
        Sao chép dữ liệu bên dưới và dán trực tiếp vào Google Sheet của bạn.
      </div>
      
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          onClick={handleCopy}
          disabled={isDisabled}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-700 disabled:text-slate-500'
          }`}
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
          {copied ? 'Đã sao chép' : 'Sao chép dữ liệu'}
        </button>

        <button
          onClick={openSheet}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
        >
          <ExternalLink size={18} />
          Mở Google Sheet
        </button>
      </div>
    </div>
  );
};

export default Actions;
