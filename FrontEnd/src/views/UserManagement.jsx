import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  UserPlus, Shield, ChevronDown, Building2, 
  KeyRound, UserCircle, CheckCircle2, UserCog, 
  Users, Search, Trash2, AlertTriangle, Lock, RefreshCw
} from 'lucide-react';

// --- CONFIRMATION MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
              <AlertTriangle size={32} />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 uppercase tracking-tight mb-2">{title}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">{message}</p>
        </div>
        <div className="flex gap-3 p-6 bg-slate-50">
          <button onClick={onClose} className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 bg-red-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 active:scale-95 transition-all"
          >
            Delete Now
          </button>
        </div>
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [roleOpen, setRoleOpen] = useState(false);
  const [depOpen, setDepOpen] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false, id: null, name: '' });
  
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [formData, setFormData] = useState({
    username: '', 
    password: '', 
    userType: 'Normal User', 
    department: ''
  });

  // 💡 MMS Core Sidebar එකේ ඇති සැබෑ මොඩියුලයන් 12 ට 100% සමාන ලැයිස්තුව
  const systemModules = [
    { key: 'dashboard', label: 'Dashboard Overview' },
    { key: 'maintenance', label: 'Maintenance Jobs' },
    { key: 'grn_create', label: 'Stock Entry (GRN)' },
    { key: 'inventory', label: 'Tool Inventory' },
    { key: 'allocation', label: 'Staff Allocation' },
    { key: 'inventory_report', label: 'Inventory Report' },
    { key: 'ticket_report', label: 'Ticket Report' },
    { key: 'workflow_setup', label: 'Workflow Setup' },
    { key: 'supplier_register', label: 'Supplier Registration' },
    { key: 'materials', label: 'Materials Registry' },
    { key: 'users', label: 'User Management' },
    { key: 'department', label: 'Department Settings' }
  ];

  const getEmptyMatrix = () => {
    return systemModules.reduce((acc, mod) => {
      acc[mod.key] = { view: false, update: false, create: false, delete: false };
      return acc;
    }, {});
  };

  const [permissionMatrix, setPermissionMatrix] = useState(getEmptyMatrix());

  useEffect(() => { 
    fetchUsers(); 
    fetchDepartments(); 
    const closeAll = () => { setRoleOpen(false); setDepOpen(false); };
    window.addEventListener('click', closeAll);
    return () => window.removeEventListener('click', closeAll);
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://192.168.1.2:5000/api/users');
      setUsers(res.data || []);
    } catch (err) { 
      console.error("Error fetching users", err); 
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://192.168.1.2:5000/api/departments');
      setDepartments(res.data || []);
    } catch (err) { 
      console.error("Error fetching departments", err); 
    }
  };

  // 💡 Role එක තේරූ විට Permissions ස්වයංක්‍රීයව Auto-fill වීම
  const handleRoleSelect = (roleId) => {
    const updated = getEmptyMatrix();

    if (roleId === 'Admin') {
      systemModules.forEach(mod => {
        updated[mod.key] = { view: true, update: true, create: true, delete: true };
      });
    } else if (roleId === 'Maintenance Staff') {
      const staffAllowed = ['dashboard', 'maintenance', 'inventory', 'inventory_report', 'ticket_report'];
      systemModules.forEach(mod => {
        updated[mod.key] = {
          view: staffAllowed.includes(mod.key),
          update: mod.key === 'maintenance',
          create: false,
          delete: false
        };
      });
    } else {
      // Normal User
      const userAllowed = ['dashboard', 'maintenance'];
      systemModules.forEach(mod => {
        updated[mod.key] = {
          view: userAllowed.includes(mod.key),
          update: false,
          create: mod.key === 'maintenance',
          delete: false
        };
      });
    }

    setPermissionMatrix(updated);
    setFormData(prev => ({ ...prev, userType: roleId }));
    setRoleOpen(false);
  };

  // User කෙනෙක් මත click කළ විට Matrix එක form එකට load වීම
  const handleSelectUserForEdit = (userObj) => {
    setSelectedUserId(userObj._id);
    setFormData({
      username: userObj.username,
      password: '',
      userType: userObj.userType || 'Normal User',
      department: userObj.department || ''
    });

    const baseMatrix = getEmptyMatrix();
    if (userObj.permissionMatrix) {
      Object.keys(baseMatrix).forEach(key => {
        if (userObj.permissionMatrix[key]) {
          baseMatrix[key] = {
            view: !!userObj.permissionMatrix[key].view,
            update: !!userObj.permissionMatrix[key].update,
            create: !!userObj.permissionMatrix[key].create,
            delete: !!userObj.permissionMatrix[key].delete
          };
        }
      });
    }
    setPermissionMatrix(baseMatrix);
    toast.success(`Loaded settings for: ${userObj.username}`);
  };

  const handleClearFormSelection = () => {
    setSelectedUserId(null);
    setFormData({ username: '', password: '', userType: 'Normal User', department: '' });
    setPermissionMatrix(getEmptyMatrix());
  };

  const handleMatrixCellChange = (moduleKey, scope) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [scope]: !prev[moduleKey]?.[scope]
      }
    }));
  };

  const handleToggleColumnAll = (scope, currentValue) => {
    const nextValue = !currentValue;
    setPermissionMatrix(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(modKey => {
        updated[modKey] = {
          ...updated[modKey],
          [scope]: nextValue
        };
      });
      return updated;
    });
  };

  const handleFormSubmitPipeline = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) return toast.error("Please enter a username");
    if (!selectedUserId && !formData.password.trim()) return toast.error("Please enter a password");
    if (!formData.department) return toast.error("Please select a department");
    
    setLoading(true);
    const toastLabel = selectedUserId ? "Updating clearance context..." : "Creating staff account...";
    const t = toast.loading(toastLabel);

    const payload = {
      ...formData,
      permissionMatrix: permissionMatrix
    };

    try {
      if (selectedUserId) {
        await axios.patch(`http://192.168.1.2:5000/api/users/update-permissions/${selectedUserId}`, payload);
        toast.success("Security Clearance Matrix updated successfully", { id: t });
      } else {
        await axios.post('http://192.168.1.2:5000/api/users/register', payload);
        toast.success("Staff Account & Access Matrix Created Successfully", { id: t });
      }
      
      handleClearFormSelection();
      fetchUsers();
    } catch (err) { 
      toast.error(err.response?.data?.message || "Operation failed", { id: t }); 
    } finally { 
      setLoading(false); 
    }
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`http://192.168.1.2:5000/api/users/${modalData.id}`);
      toast.success("User deleted successfully");
      if (selectedUserId === modalData.id) handleClearFormSelection();
      fetchUsers();
    } catch (err) { 
      toast.error("Delete failed"); 
    }
  };

  const filteredUsers = users.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-500 font-sans text-black select-none bg-[#EFEFEF]">
      
      {/* 1. REGISTRATION & EDIT FORM SECTION */}
      <form onSubmit={handleFormSubmitPipeline} className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-200 max-w-6xl mx-auto grid grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: IDENTITY PARAMETERS */}
        <div className="col-span-12 lg:col-span-5 space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <UserPlus size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-800">
                  {selectedUserId ? "Modify Access Profile" : "Register New Staff"}
                </h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">MMS Core Access Management</p>
              </div>
            </div>

            {selectedUserId && (
              <button 
                type="button" 
                onClick={handleClearFormSelection}
                className="text-[10px] text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl uppercase tracking-wider transition-all font-mono cursor-pointer"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Account Username</label>
            <div className="relative group flex items-center">
              <UserCircle className="absolute left-4 text-slate-300 group-focus-within:text-[#A47148] transition-colors" size={20} />
              <input 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#A47148] transition-all uppercase" 
                placeholder="e.g. jhon_doe" 
                value={formData.username} 
                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                disabled={!!selectedUserId}
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {selectedUserId ? "Secure Password (Leave blank to keep unchanged)" : "Secure Password"}
            </label>
            <div className="relative group flex items-center">
              <KeyRound className="absolute left-4 text-slate-300 group-focus-within:text-[#A47148] transition-colors" size={20} />
              <input 
                type="password" 
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:border-[#A47148] transition-all" 
                placeholder="••••••••" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required={!selectedUserId} 
              />
            </div>
          </div>

          {/* ROLE DROPDOWN */}
          <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">System Permission Role</label>
            <button 
              type="button" 
              onClick={() => { setRoleOpen(!roleOpen); setDepOpen(false); }} 
              className={`w-full flex items-center justify-between pl-12 pr-6 py-4 bg-white border rounded-2xl text-sm transition-all cursor-pointer ${roleOpen ? 'border-[#A47148] ring-4 ring-[#A47148]/5' : 'border-slate-200'}`}
            >
              <Shield className={`absolute left-4 ${roleOpen ? 'text-[#A47148]' : 'text-slate-300'}`} size={20} />
              <span className="uppercase font-medium text-slate-700">{formData.userType}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${roleOpen ? 'rotate-180' : ''}`} />
            </button>
            {roleOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 overflow-hidden py-2 animate-in slide-in-from-top-2">
                {[
                  { id: 'Admin', icon: Shield, label: 'Admin Access' }, 
                  { id: 'Maintenance Staff', icon: UserCog, label: 'Maintenance Staff' }, 
                  { id: 'Normal User', icon: Users, label: 'Standard User' }
                ].map((role) => (
                  <div 
                    key={role.id} 
                    onClick={() => handleRoleSelect(role.id)} 
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${formData.userType === role.id ? 'bg-[#A47148]/10 text-[#A47148]' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wider">{role.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEPARTMENT DROPDOWN */}
          <div className="space-y-2 relative" onClick={(e) => e.stopPropagation()}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
            <button 
              type="button" 
              onClick={() => { setDepOpen(!depOpen); setRoleOpen(false); }} 
              className={`w-full flex items-center justify-between pl-12 pr-6 py-4 bg-white border rounded-2xl text-sm transition-all cursor-pointer ${depOpen ? 'border-[#A47148] ring-4 ring-[#A47148]/5' : 'border-slate-200'}`}
            >
              <Building2 className={`absolute left-4 ${depOpen ? 'text-[#A47148]' : 'text-slate-300'}`} size={20} />
              <span className="uppercase font-medium text-slate-700">{formData.department || "Select Department"}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${depOpen ? 'rotate-180' : ''}`} />
            </button>
            {depOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-3xl shadow-xl z-50 overflow-hidden py-2 max-h-60 overflow-y-auto">
                {departments.map((dep) => (
                  <div 
                    key={dep._id} 
                    onClick={() => { setFormData({...formData, department: dep.name}); setDepOpen(false); }} 
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${formData.department === dep.name ? 'bg-[#A47148]/10 text-[#A47148]' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wider">{dep.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACCESS CONTROL MATRIX */}
        <div className="col-span-12 lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden text-left shadow-inner">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <Lock size={15} className="text-slate-500" />
            <h3 className="text-xs font-normal uppercase tracking-wider text-slate-700">Role Based Access Matrix Configuration</h3>
          </div>

          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-[9px] text-slate-500 uppercase tracking-wider font-mono select-none">
                  <th className="px-5 py-3 border-r border-slate-200 w-48">Core Modules</th>
                  <th onClick={() => handleToggleColumnAll('view', Object.values(permissionMatrix).every(m => m.view))} className="px-2 py-3 text-center border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition-colors w-20">View / Access ⬇</th>
                  <th onClick={() => handleToggleColumnAll('update', Object.values(permissionMatrix).every(m => m.update))} className="px-2 py-3 text-center border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition-colors w-20">Update ⬇</th>
                  <th onClick={() => handleToggleColumnAll('create', Object.values(permissionMatrix).every(m => m.create))} className="px-2 py-3 text-center border-r border-slate-200 cursor-pointer hover:bg-slate-200/50 transition-colors w-20">Create ⬇</th>
                  <th onClick={() => handleToggleColumnAll('delete', Object.values(permissionMatrix).every(m => m.delete))} className="px-2 py-3 text-center cursor-pointer hover:bg-slate-200/50 transition-colors w-20">Delete ⬇</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-black">
                {systemModules.map((mod) => (
                  <tr key={mod.key} className="bg-white font-normal hover:bg-slate-50/50 transition-colors uppercase">
                    <td className="px-5 py-2 border-r border-slate-200 font-mono tracking-tight text-[11px] text-slate-700 whitespace-nowrap">
                      {mod.label}
                    </td>
                    <td className="p-2 text-center border-r border-slate-100 bg-slate-50/10">
                      <input 
                        type="checkbox" 
                        checked={permissionMatrix[mod.key]?.view || false} 
                        onChange={() => handleMatrixCellChange(mod.key, 'view')} 
                        className="w-4 h-4 text-slate-900 bg-slate-50 border-slate-300 rounded focus:ring-0 cursor-pointer accent-slate-900" 
                      />
                    </td>
                    <td className="p-2 text-center border-r border-slate-100">
                      <input 
                        type="checkbox" 
                        checked={permissionMatrix[mod.key]?.update || false} 
                        onChange={() => handleMatrixCellChange(mod.key, 'update')} 
                        className="w-4 h-4 text-slate-900 bg-slate-50 border-slate-300 rounded focus:ring-0 cursor-pointer accent-slate-900" 
                      />
                    </td>
                    <td className="p-2 text-center border-r border-slate-100 bg-slate-50/10">
                      <input 
                        type="checkbox" 
                        checked={permissionMatrix[mod.key]?.create || false} 
                        onChange={() => handleMatrixCellChange(mod.key, 'create')} 
                        className="w-4 h-4 text-slate-900 bg-slate-50 border-slate-300 rounded focus:ring-0 cursor-pointer accent-slate-900" 
                      />
                    </td>
                    <td className="p-2 text-center">
                      <input 
                        type="checkbox" 
                        checked={permissionMatrix[mod.key]?.delete || false} 
                        onChange={() => handleMatrixCellChange(mod.key, 'delete')} 
                        className="w-4 h-4 text-slate-900 bg-slate-50 border-slate-300 rounded focus:ring-0 cursor-pointer accent-slate-900" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          disabled={loading} 
          className="col-span-12 py-5 bg-[#A47148] text-white font-bold uppercase text-[10px] tracking-[0.3em] rounded-2xl shadow-xl shadow-[#A47148]/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing Transaction...' : selectedUserId ? 'Update Active Staff Access Clearance Tokens' : 'Create Staff Account & Core Access Tokens'}
        </button>
      </form>

      {/* --- 2. SEARCH & DIRECTORY TABLE --- */}
      <div className="max-w-6xl mx-auto space-y-4 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
          <div className="text-left">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active System Identity Directory</h3>
            <p className="text-[9px] text-slate-400 lowercase italic tracking-tight mt-0.5">* Tip: Click on any user row to dynamically load and edit their permission token configuration matrix</p>
          </div>
          
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#A47148] transition-colors" size={18} />
            <input 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-[#A47148] transition-all shadow-sm"
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Username Reference</th>
                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role Authorization Access</th>
                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department Domain</th>
                <th className="px-8 py-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Purge Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs text-black uppercase">
              {filteredUsers.map((u) => (
                <tr 
                  key={u._id} 
                  onClick={() => handleSelectUserForEdit(u)}
                  className={`cursor-pointer transition-all ${selectedUserId === u._id ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-slate-50/50'}`}
                >
                  <td className="px-8 py-5 font-sans font-bold text-slate-700 normal-case">{u.username}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[9px] font-bold uppercase tracking-widest">{u.userType}</span>
                  </td>
                  <td className="px-8 py-5 text-slate-500">{u.department || 'N/A'}</td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button 
                      type="button" 
                      disabled={u.username === 'admin'}
                      onClick={() => setModalData({ isOpen: true, id: u._id, name: u.username })}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        onConfirm={executeDelete}
        title="Remove Staff Identity"
        message={`Are you sure you want to delete ${modalData.name}? This action will permanently purge security clearance definitions.`}
      />
    </div>
  );
};

export default UserManagement;