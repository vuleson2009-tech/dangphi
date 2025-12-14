import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, X } from 'lucide-react';
import { SAMPLE_PROMPTS } from '../constants';

interface SmartInputProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

const SmartInput: React.FC<SmartInputProps> = ({ onAnalyze, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAnalyze(text);
    }
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <Sparkles size={20} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Nhập liệu thông minh (AI)</h2>
        </div>
        {text && !isLoading && (
          <button
            onClick={handleClear}
            className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
            title="Xóa nội dung"
          >
            <X size={14} />
            Xóa
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ví dụ: Sáng nay ăn phở 45k, đổ xăng 50k..."
            className="w-full h-36 p-4 pb-14 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all text-slate-700 placeholder-slate-400"
            disabled={isLoading}
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-5 left-4 text-xs text-slate-400 font-medium select-none">
            {text.length} ký tự
          </div>

          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="absolute bottom-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Đang xử lý...
              </>
            ) : (
              <>
                Phân tích
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4">
        <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Thử mẫu câu:</p>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setText(prompt)}
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartInput;