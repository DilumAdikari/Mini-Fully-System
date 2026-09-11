import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

const MaintenanceForm = ({ isOpen, onClose, onRefresh }) => {
  const { user } = useApp();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'Repair',
    unit: 'Elisha',
    department: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const systemColor = "#A47148";

  useEffect(() => {
    if (isOpen) {
      axios.get('http://192.168.1.2:5000/api/departments')
        .then(res => {
          const deps = res.data || [];
          setDepartments(deps);
          if (deps.length > 0) {
            setFormData(prev => ({ ...prev, department: deps[0].name }));
          }
        })
        .catch(err => console.error("Departments fetch failed:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const t = toast.loading('Syncing with database...');
    
    try {
      if (!formData.department) {
        throw new Error("Please select a department.");
      }

      // Payload එකට unit, department, date කෙලින්ම යවනවා (Priority සම්පූර්ණයෙන්ම අයින් කර ඇත)
      const payload = {
        title: formData.title,
        type: formData.type,
        unit: formData.unit,
        department: formData.department,
        date: formData.date,
        description: formData.description,
        requestedBy: user?.name || user?.username || "admin",
        userId: user?.uid || user?._id || "system",
        status: 'Assign Pending'
      };

      console.log("🚀 Payload sending to server:", payload);

      await axios.post('http://192.168.1.2:5000/api/requests', payload);
      
      toast.success('Request Submitted Successfully!', { id: t });
      setFormData({
        title: '',
        type: 'Repair',
        unit: 'Elisha',
        department: departments[0]?.name || '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      if (onRefresh) onRefresh(); 
      onClose();   
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message;
      toast.error(`Failed: ${serverMsg}`, { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">New Maintenance Request</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Issue Title</label>
            <input 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#A47148]"
              placeholder="e.g. AC Leaking in Room 204"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Job Type</label>
              <select 
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer focus:border-[#A47148]"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Repair">Repair</option>
                <option value="Preventive">Preventive</option>
                <option value="Installation">Installation</option>
                <option value="Emergency">Emergency</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Furniture">Furniture</option>
                <option value="Network">Network</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Date</label>
              <input 
                type="date"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:border-[#A47148]"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Factory / Unit</label>
              <select 
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer focus:border-[#A47148]"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                <option value="Elisha">Elisha</option>
                <option value="Usha">Usha</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Department</label>
              <select 
                required
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none cursor-pointer uppercase focus:border-[#A47148]"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                {departments.length === 0 ? (
                  <option value="" disabled>Loading...</option>
                ) : (
                  departments.map((dept) => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Detailed Description</label>
            <textarea 
              rows="3"
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-[#A47148] resize-none"
              placeholder="Describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] py-3.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
              style={{ backgroundColor: systemColor }}
            >
              {loading ? "Saving..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;