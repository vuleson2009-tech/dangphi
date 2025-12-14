import React, { useState } from 'react';
import { Lock, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';

interface ChangePasswordProps {
  username: string;
  onSuccess: (user: User) => void;
}

const ChangePassword: React.FC<ChangePasswordProps> = ({ username, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      authService.changePassword(username, newPassword);
      const updatedUser = authService.getCurrentUser();
      if (updatedUser) {
        onSuccess(updatedUser);
      }
    } catch (e) {
      setError('Đã xảy ra lỗi khi đổi mật khẩu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mx-auto mb-4">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Cần đổi mật khẩu</h2>
          <p className="text-slate-500 mt-2 text-sm">
            Vì lý do bảo mật, bạn cần đổi mật khẩu mặc định trong lần đăng nhập đầu tiên.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Nhập mật khẩu mới"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Đổi mật khẩu và Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;