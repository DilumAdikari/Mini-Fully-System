import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { X, UserCheck, FileText, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

// --- INTERNAL COMPONENT: JOB DETAILS & ASSIGN / COMPLETE MODAL ---
const JobDetailsModal = ({ isOpen, onClose, job, staffList, onAssign, onAdminComplete, userRole }) => {
  if (!isOpen || !job) return null;

  const getSafeDate = (dateVal) => {
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return "Date Not Set";
      return d.toISOString().split('T')[0];
    } catch (e) {
      return "Invalid Date";
    }
  };

  const currentStatus = job.status;
  const isDraft = currentStatus === 'Assign Pending' || currentStatus === 'DRAFT';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans antialiased text-slate-800 tracking-normal">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                <FileText size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase">Job Details</h3>
                <p className="text-xs font-mono text-blue-600 font-semibold mt-0.5">{job.tid}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition-colors border border-slate-200">
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Info Content */}
          <div className="space-y-4 mb-5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
              <p className="text-xs font-semibold text-slate-800 uppercase">{job.title || job.description || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Created Date</label>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{getSafeDate(job.date)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current Status</label>
                <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{isDraft ? 'DRAFT' : currentStatus}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Staff</label>
              <p className="text-xs font-semibold text-slate-800 uppercase">{job.assignedTo || 'Unassigned'}</p>
            </div>
          </div>

          {/* Step 1: Admin assigns a maintenance member */}
          {userRole === 'admin' && isDraft && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 mb-5">
              <label className="text-xs font-bold text-slate-600 block flex items-center gap-1.5">
                <UserCheck size={14} /> Assign Maintenance Member
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-md outline-none focus:border-slate-500 transition-all uppercase font-sans"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) onAssign(job._id, e.target.value);
                }}
              >
                <option value="" disabled>Select Maintenance Member</option>
                {staffList.map(s => (
                  <option key={s._id} value={`${s._id}|${s.username}`}>{s.username}</option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Job Complete Action - Only for Admin when job is Assigned */}
          <div>
            {userRole === 'admin' && job.status === 'Assigned' && (
              <button 
                onClick={() => onAdminComplete(job._id)}
                className="w-full py-2.5 bg-emerald-600 text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} /> Complete Maintenance Job
              </button>
            )}

            {job.status === 'Completed' && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-center">
                <p className="text-xs font-bold text-emerald-700 uppercase">Job Completed</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-2.5 text-center border-t border-slate-200">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">MMS Task Management Portal</p>
        </div>
      </div>
    </div>
  );
};

// --- MAIN VIEW COMPONENT ---
const MaintenanceView = ({ requests = [], onRefresh }) => {
  const { user } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('http://192.168.1.2:5000/api/users/staff')
        .then(res => setStaffList(res.data))
        .catch(err => console.error("Error loading staff", err));
    }
  }, [user]);

  const rowStyles = {
    'Assign Pending': { bg: '#F8D7DA', text: '#721C24' },
    'DRAFT':          { bg: '#F8D7DA', text: '#721C24' },
    'Assigned':       { bg: '#CCE5FF', text: '#004085' },
    'Completed':      { bg: '#D4EDDA', text: '#155724' },
    'default':        { bg: '#FFFFFF', text: '#334155' }
  };

  const handleAssign = async (id, staff) => {
    try {
      const [staffId, staffName] = staff.split('|');
      await axios.patch(`http://192.168.1.2:5000/api/requests/assign/${id}`, { staffId, staffName });
      toast.success("Job Assigned Successfully");
      setSelectedJob(null);
      if (onRefresh) onRefresh();
    } catch (err) { 
      toast.error("Assignment failed"); 
    }
  };

  // 💡 ADMIN ONLY COMPLETE CALL
  const handleAdminComplete = async (id) => {
    try {
      await axios.patch(`http://192.168.1.2:5000/api/requests/admin-complete/${id}`);
      toast.success("Job Marked as Completed Successfully");
      setSelectedJob(null);
      if (onRefresh) onRefresh();
    } catch (err) { 
      toast.error("Failed to complete job"); 
    }
  };

  return (
    <div className="p-4 animate-in fade-in duration-300 font-sans antialiased text-slate-700 tracking-normal bg-white">
      <div className="mb-5 flex justify-between items-end px-1 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Maintenance Jobs</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Operational Task Tracking</p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Records: {requests.length}</p>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden shadow-none rounded-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">ID</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Description</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Assigned To</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Date</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase border-r border-slate-200">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-normal tracking-normal">
            {requests.map((req) => {
              const style = rowStyles[req.status] || rowStyles.default;
              return (
                <tr 
                  key={req._id} 
                  style={{ backgroundColor: style.bg, color: style.text }}
                  className="border-b border-slate-200 transition-all hover:brightness-98 cursor-pointer"
                  onClick={() => setSelectedJob(req)}
                >
                  <td className="px-4 py-2 font-semibold border-r border-slate-200/60 font-mono tracking-wide">{req.tid}</td>
                  <td className="px-4 py-2 font-semibold uppercase border-r border-slate-200/60">{req.title || req.description}</td>
                  <td className="px-4 py-2 font-semibold uppercase border-r border-slate-200/60">{req.assignedTo || '---'}</td>
                  <td className="px-4 py-2 border-r border-slate-200/60 font-mono text-slate-600">
                    {req.date ? new Date(req.date).toISOString().split('T')[0] : 'Date Not Set'}
                  </td>
                  <td className="px-4 py-2 font-bold uppercase border-r border-slate-200/60">{req.status === 'Assign Pending' ? 'DRAFT' : req.status}</td>
                  <td className="px-4 py-2 text-center font-bold text-[9px] uppercase tracking-wider opacity-60 text-slate-700 underline">
                    View Details
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <JobDetailsModal 
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        staffList={staffList}
        onAssign={handleAssign}
        onAdminComplete={handleAdminComplete}
        userRole={user?.role}
      />
    </div>
  );
};

export default MaintenanceView;