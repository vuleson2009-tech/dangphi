import React, { useState, useEffect } from 'react';
import { User, Shield, UserPlus, Trash2, X, Check, Pencil } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [formMode, setFormMode] = useState<'none' | 'add' | 'edit'>('none');
  const [currentUserData, setCurrentUserData] = useState({ username: '', password: '', fullName: '', role: 'user' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  const handleAddNew = () => {
    setFormMode('add');
    setCurrentUserData({ username: '', password: '', fullName: '', role: 'user' });
    setError('');
  };

  const handleEdit = (user: UserType) => {
    setFormMode('edit');
    // We don't load the password for security/display reasons, leave blank implies no change
    setCurrentUserData({ 
      username: user.username, 
      password: '', 
      fullName: user.fullName, 
      role: user.role 
    });
    setError('');
  };

  const handleCancel = () => {
    setFormMode('none');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (formMode === 'add') {
        if (!currentUserData.username || !currentUserData.password || !currentUserData.fullName) {
          setError('Vui lòng điền đầy đủ thông tin');
          return;
        }

        const success = authService.addUser({
          username: currentUserData.username,
          password: currentUserData.password,
          fullName: currentUserData.fullName,
          role: currentUserData.role as 'admin' | 'user',
          createdAt: ''
        });

        if (!success) {
          setError('Tên đăng nhập đã tồn tại');
          return;
        }
      } else if (formMode === 'edit') {
        if (!currentUserData.fullName) {
          setError('Họ tên không được để trống');
          return;
        }

        const updates: Partial<UserType> = {
          fullName: currentUserData.fullName,
          role: currentUserData.role as 'admin' | 'user'
        };
        // Only update password if provided
        if (currentUserData.password) {
          updates.password = currentUserData.password;
        }

        authService.updateUser(currentUserData.username, updates);
      }

      loadUsers();
      setFormMode('none');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = (username: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa user "${username}"?`)) {
      try {
        authService.deleteUser(username);
        loadUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-2 text-slate-800">
          <Shield className="text-indigo-600" size={24} />
          <h2 className="text-xl font-bold">Quản lý Người dùng</h2>
        </div>
        {formMode === 'none' && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <UserPlus size={16} />
            Thêm User mới
          </button>
        )}
      </div>

      <div className="p-6">
        {formMode !== 'none' && (
          <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 p-6 rounded-xl border border-indigo-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-semibold text-slate-700 mb-4">
              {formMode === 'add' ? 'Thêm tài khoản mới' : `Chỉnh sửa: ${currentUserData.username}`}
            </h3>
            {error && <div className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded border border-red-100">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Tên đăng nhập</label>
                <input
                  type="text"
                  value={currentUserData.username}
                  onChange={e => setCurrentUserData({...currentUserData, username: e.target.value})}
                  className={`w-full p-2 border border-slate-300 rounded-md text-sm ${formMode === 'edit' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                  placeholder="username"
                  disabled={formMode === 'edit'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {formMode === 'edit' ? 'Mật khẩu mới (Để trống nếu giữ nguyên)' : 'Mật khẩu'}
                </label>
                <input
                  type="text"
                  value={currentUserData.password}
                  onChange={e => setCurrentUserData({...currentUserData, password: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  placeholder={formMode === 'edit' ? "********" : "password"}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={currentUserData.fullName}
                  onChange={e => setCurrentUserData({...currentUserData, fullName: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Phân quyền</label>
                <select
                  value={currentUserData.role}
                  onChange={e => setCurrentUserData({...currentUserData, role: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white"
                >
                  <option value="user">User (Nhập liệu)</option>
                  <option value="admin">Admin (Toàn quyền)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Check size={16} /> {formMode === 'add' ? 'Lưu User' : 'Cập nhật'}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Tên đăng nhập</th>
                <th className="px-4 py-3">Họ và tên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3 text-right rounded-tr-lg">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border border-slate-100">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{user.username}</td>
                  <td className="px-4 py-3 text-slate-600">{user.fullName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                        title="Sửa thông tin"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.username)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Xóa người dùng"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;