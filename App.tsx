import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_COLUMNS } from './constants';
import { ColumnDefinition, SheetRow, User } from './types';
import { extractDataFromText } from './services/geminiService';
import { authService } from './services/authService';
import { fuzzyMatch } from './utils/stringUtils';
import SmartInput from './components/SmartInput';
import DataTable from './components/DataTable';
import Actions from './components/Actions';
import ColumnConfig from './components/ColumnConfig';
import DataChart from './components/DataChart';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ChangePassword from './components/ChangePassword';
import { TableProperties, Database, Settings2, Search, X, BarChart3, Cloud, LogOut, Shield, User as UserIcon, Calendar, Download, Smartphone } from 'lucide-react';

const STORAGE_KEY_DATA = 'smartsheet_data';
const STORAGE_KEY_COLUMNS = 'smartsheet_columns';

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');

  // --- DATA STATE ---
  const [columns, setColumns] = useState<ColumnDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COLUMNS);
      return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
    } catch (e) {
      console.error("Failed to load columns from storage", e);
      return DEFAULT_COLUMNS;
    }
  });

  const [data, setData] = useState<SheetRow[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load data from storage", e);
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showChart, setShowChart] = useState(true);
  
  // --- PWA INSTALL STATE ---
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  // Initialize Auth & Install Prompt
  useEffect(() => {
    authService.init(); // Ensure default admin exists
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Listen for PWA install event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-save effects
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_COLUMNS, JSON.stringify(columns));
    }
  }, [columns, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    }
  }, [data, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('dashboard');
  };

  const handlePasswordChanged = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleInstallApp = () => {
    if (installPrompt) {
      installPrompt.prompt();
      installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          setInstallPrompt(null);
        }
      });
    }
  };

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await extractDataFromText(text, columns);
      setData(prev => [...prev, ...result]);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi xử lý.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRow = (index: number) => {
    setData(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, key: string, value: string) => {
    setData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [key]: value };
      return newData;
    });
  };

  const handleAddRow = () => {
    const emptyRow: SheetRow = {};
    columns.forEach(col => { emptyRow[col.id] = ''; });
    setData(prev => [...prev, emptyRow]);
  };

  const handleSaveColumns = (newColumns: ColumnDefinition[]) => {
    setColumns(newColumns);
    setShowConfig(false);
  };

  // Filter data based on search query and date range
  const displayedData = useMemo(() => {
    return data
      .map((row, index) => ({ ...row, _originalIndex: index })) // Preserve original index for editing
      .filter((row) => {
        // 1. Search Filter with Fuzzy Match
        let matchesSearch = true;
        if (searchQuery.trim()) {
          matchesSearch = columns.some((col) => {
            const val = row[col.id];
            return val !== undefined && val !== null && fuzzyMatch(String(val), searchQuery);
          });
        }
        
        if (!matchesSearch) return false;

        // 2. Date Range Filter
        let matchesDate = true;
        if (startDate || endDate) {
          const dateCol = columns.find(c => c.id === 'date') || columns.find(c => c.type === 'date');
          if (dateCol) {
             const rowDate = String(row[dateCol.id] || '');
             // Ensure we are comparing comparable strings (ISO date format YYYY-MM-DD works well)
             if (startDate && rowDate < startDate) matchesDate = false;
             if (endDate && rowDate > endDate) matchesDate = false;
          }
        }

        return matchesDate;
      });
  }, [data, searchQuery, columns, startDate, endDate]);

  // --- RENDER LOGIN IF NOT AUTHENTICATED ---
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // --- RENDER CHANGE PASSWORD IF REQUIRED ---
  if (currentUser.mustChangePassword) {
    return <ChangePassword username={currentUser.username} onSuccess={handlePasswordChanged} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Database size={18} />
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">SmartSheet Entry</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Install App Button (Visible if PWA is installable) */}
            {installPrompt && (
              <button
                onClick={handleInstallApp}
                className="hidden md:flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-indigo-700 transition-all shadow-sm animate-pulse mr-2"
              >
                <Smartphone size={14} />
                <span>Cài App</span>
              </button>
            )}

            <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full mr-2">
               <UserIcon size={14} />
               <span className="font-medium">{currentUser.fullName}</span>
               <span className="text-xs text-slate-400">({currentUser.role})</span>
            </div>

            {currentUser.role === 'admin' && (
              <button
                onClick={() => setView(view === 'dashboard' ? 'admin' : 'dashboard')}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${
                  view === 'admin' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield size={18} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {view === 'dashboard' && (
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`p-2 rounded-lg transition-all ${showConfig ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                title="Cấu hình cột"
              >
                <Settings2 size={20} />
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        
        {view === 'admin' ? (
          /* --- ADMIN VIEW --- */
          <AdminPanel />
        ) : (
          /* --- DASHBOARD VIEW --- */
          <>
            {/* Intro */}
            {!showConfig && (
              <div className="mb-8 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between mb-2">
                  <h2 className="text-2xl font-bold text-slate-800">Nhập liệu bảng tính</h2>
                  <div className="flex gap-2">
                    {/* Mobile Install Button */}
                    {installPrompt && (
                      <button
                        onClick={handleInstallApp}
                        className="sm:hidden flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-700 transition-all shadow-sm"
                      >
                        <Download size={12} />
                        Cài App
                      </button>
                    )}
                    {data.length > 0 && (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <Cloud size={12} />
                        Đã lưu tự động
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-600">
                  Nhập ghi chú tự nhiên hoặc điền thủ công vào bảng bên dưới.
                </p>
              </div>
            )}

            {/* Configuration Panel */}
            {showConfig && (
              <ColumnConfig 
                columns={columns} 
                onSave={handleSaveColumns} 
                onCancel={() => setShowConfig(false)} 
              />
            )}

            {/* Input Section */}
            {!showConfig && (
              <SmartInput onAnalyze={handleAnalyze} isLoading={isLoading} />
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Data Table Section */}
            <div className="space-y-4">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold shrink-0">
                  <TableProperties size={20} />
                  <h3>Dữ liệu ({displayedData.length}/{data.length})</h3>
                  {data.length > 0 && (
                    <button
                      onClick={() => setShowChart(!showChart)}
                      className={`ml-2 p-1 rounded-md transition-colors ${showChart ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-indigo-600'}`}
                      title="Bật/Tắt biểu đồ"
                    >
                      <BarChart3 size={18} />
                    </button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full xl:w-auto">
                  
                  {/* Date Range Filter */}
                  <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-2 py-1.5 shadow-sm w-full sm:w-auto transition-colors focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
                    <Calendar size={14} className="text-slate-400 hidden sm:block" />
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-sm bg-transparent border-none outline-none text-slate-600 focus:ring-0 w-full sm:w-auto p-0"
                      placeholder="Từ"
                    />
                    <span className="text-slate-300">-</span>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-sm bg-transparent border-none outline-none text-slate-600 focus:ring-0 w-full sm:w-auto p-0"
                      placeholder="Đến"
                    />
                    {(startDate || endDate) && (
                      <button 
                        onClick={() => { setStartDate(''); setEndDate(''); }}
                        className="ml-1 p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Xóa lọc ngày"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Search Box */}
                  <div className="relative flex-1 sm:w-64 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm (chấp nhận lỗi gõ)..." 
                      className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {data.length > 0 && (
                    <button 
                      onClick={() => setData([])}
                      className="text-xs text-red-500 hover:text-red-700 font-medium hover:underline whitespace-nowrap px-2"
                    >
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
              
              <DataTable 
                columns={columns} 
                data={displayedData} 
                onDeleteRow={handleDeleteRow} 
                onUpdateRow={handleUpdateRow}
                onAddRow={handleAddRow}
              />
            </div>

            {/* Chart Section - use displayedData for filtered charts */}
            {showChart && data.length > 0 && !showConfig && (
               <DataChart data={displayedData.length > 0 ? displayedData : []} />
            )}

            {/* Action / Export Section */}
            <Actions data={displayedData} columns={columns} />
          </>
        )}

      </main>
    </div>
  );
};

export default App;