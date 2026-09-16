import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useApp } from '../context/AppContext';
import { 
  X, UserCheck, FileText, CheckCircle2, Search, RotateCcw, 
  Users, Truck 
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- INTERNAL COMPONENT: JOB DETAILS & ASSIGN / COMPLETE MODAL ---
const JobDetailsModal = ({ isOpen, onClose, job, staffList, serviceProviders, onAssign, onAdminComplete, userRole }) => {
  const [assignCategory, setAssignCategory] = useState('INTERNAL');

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

  // 💡 Safe Check: Service Provider ද යන්න හඳුනාගැනීම (assignType හෝ නමේ ඇති bracket මඟින්)
  const isExternalProvider = Boolean(
    job.assignType === 'EXTERNAL' ||
    (job.assignedTo && (job.assignedTo.includes('[') || job.assignedTo.includes('NIC:')))
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans antialiased text-slate-800 tracking-normal">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-6">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">Job Details</h3>
                <p className="text-xs font-mono text-blue-600 font-bold mt-0.5">{job.tid}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer">
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Info Content */}
          <div className="space-y-3 mb-5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Description</label>
              <p className="text-xs font-semibold text-slate-800 uppercase">{job.title || job.description || 'N/A'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Created Date</label>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{getSafeDate(job.date)}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Current Status</label>
                <p className="text-xs font-bold text-slate-700 uppercase mt-0.5">{isDraft ? 'DRAFT' : currentStatus}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Unit / Factory</label>
                <p className="text-xs font-semibold text-slate-800 uppercase">{job.unit || 'Elisha'}</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Department</label>
                <p className="text-xs font-semibold text-slate-800 uppercase">{job.department || '---'}</p>
              </div>
            </div>

            {/* 💡 Assigned Personnel Display (Dynamic Badge Fixed) */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Assigned Personnel</label>
                <p className="text-xs font-bold text-slate-800 uppercase">{job.assignedTo || 'Unassigned'}</p>
              </div>
              {job.assignedTo && (
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                  isExternalProvider 
                    ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                    : 'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {isExternalProvider ? 'Service Provider' : 'Maintenance Staff'}
                </span>
              )}
            </div>
          </div>

          {/* Step 1: Admin Assign Panel with Category Selection */}
          {userRole === 'admin' && isDraft && (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mb-5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase">
                <UserCheck size={15} /> Select Assignment Channel
              </label>

              {/* Toggle Switch Buttons */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/70 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAssignCategory('INTERNAL')}
                  className={`py-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    assignCategory === 'INTERNAL'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} /> Internal Staff
                </button>

                <button
                  type="button"
                  onClick={() => setAssignCategory('EXTERNAL')}
                  className={`py-2 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    assignCategory === 'EXTERNAL'
                      ? 'bg-[#A47148] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Truck size={14} /> Service Provider
                </button>
              </div>

              {/* Dynamic Dropdown depending on Selected Channel */}
              {assignCategory === 'INTERNAL' ? (
                <select
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-lg outline-none focus:border-slate-500 uppercase cursor-pointer"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const [staffId, staffName] = e.target.value.split('|');
                      onAssign(job._id, {
                        assignType: 'INTERNAL',
                        targetId: staffId,
                        targetName: staffName
                      });
                    }
                  }}
                >
                  <option value="" disabled>Select In-House Maintenance Staff</option>
                  {staffList.map(s => (
                    <option key={s._id} value={`${s._id}|${s.username}`}>
                      {s.username} - [INTERNAL STAFF]
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  className="w-full px-3 py-2.5 bg-white border border-amber-300 text-slate-800 text-xs font-medium rounded-lg outline-none focus:border-[#A47148] uppercase cursor-pointer"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      const [spId, spName] = e.target.value.split('|');
                      onAssign(job._id, {
                        assignType: 'EXTERNAL',
                        targetId: spId,
                        targetName: spName
                      });
                    }
                  }}
                >
                  <option value="" disabled>Select External Service Provider</option>
                  {serviceProviders.map(sp => (
                    <option key={sp._id} value={`${sp._id}|${sp.name} [${sp.serviceType}]`}>
                      {sp.name} — NIC: {sp.nic || 'N/A'} ({sp.serviceType})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 2: Job Complete Action */}
          <div>
            {userRole === 'admin' && job.status === 'Assigned' && (
              <button 
                onClick={() => onAdminComplete(job._id)}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 size={16} /> Complete Maintenance Job
              </button>
            )}

            {job.status === 'Completed' && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
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

// --- MAIN VIEW COMPONENT WITH FILTER CONTROLS ---
const MaintenanceView = ({ requests = [], onRefresh }) => {
  const { user } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  // 🔍 Filter States
  const [searchTicket, setSearchTicket] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [channelFilter, setChannelFilter] = useState('ALL'); // 'ALL' | 'INTERNAL' | 'EXTERNAL'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      axios.get('http://192.168.1.2:5000/api/users/staff')
        .then(res => setStaffList(res.data || []))
        .catch(err => console.error("Error loading staff", err));

      axios.get('http://192.168.1.2:5000/api/service-providers')
        .then(res => setServiceProviders(res.data || []))
        .catch(err => console.error("Error loading service providers", err));
    }
  }, [user]);

  const rowStyles = {
    'Assign Pending': { bg: '#F8D7DA', text: '#721C24' },
    'DRAFT':          { bg: '#F8D7DA', text: '#721C24' },
    'Assigned':       { bg: '#CCE5FF', text: '#004085' },
    'Completed':      { bg: '#D4EDDA', text: '#155724' },
    'default':        { bg: '#FFFFFF', text: '#334155' }
  };

  const handleAssign = async (id, assignData) => {
    try {
      const res = await axios.patch(`http://192.168.1.2:5000/api/requests/assign/${id}`, assignData);
      toast.success(
        assignData.assignType === 'EXTERNAL' 
          ? "Assigned to Service Provider Successfully" 
          : "Assigned to Maintenance Staff Successfully"
      );
      
      // Update local state if needed or close
      setSelectedJob(res.data || null);
      setSelectedJob(null);
      if (onRefresh) onRefresh();
    } catch (err) { 
      toast.error("Assignment failed"); 
    }
  };

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

  const handleResetFilters = () => {
    setSearchTicket('');
    setStatusFilter('ALL');
    setChannelFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  // ⚡ Filtering Operations
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Ticket ID / Title / Description / Assignee Search
      if (searchTicket.trim()) {
        const query = searchTicket.toLowerCase().trim();
        const matchesTid = req.tid?.toLowerCase().includes(query);
        const matchesDesc = (req.title || req.description || '')?.toLowerCase().includes(query);
        const matchesDept = req.department?.toLowerCase().includes(query);
        const matchesAssignee = req.assignedTo?.toLowerCase().includes(query);
        if (!matchesTid && !matchesDesc && !matchesDept && !matchesAssignee) return false;
      }

      // 2. Status Filtering
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'DRAFT' && req.status !== 'Assign Pending' && req.status !== 'DRAFT') {
          return false;
        } else if (statusFilter !== 'DRAFT' && req.status !== statusFilter) {
          return false;
        }
      }

      // 3. Channel Filter (Internal Staff vs Service Provider)
      if (channelFilter !== 'ALL') {
        const isExternal = req.assignType === 'EXTERNAL' || (req.assignedTo && req.assignedTo.includes('['));
        if (channelFilter === 'EXTERNAL' && !isExternal) return false;
        if (channelFilter === 'INTERNAL' && isExternal) return false;
      }

      // 4. Date Range Filtering
      if (startDate || endDate) {
        const reqDateStr = req.date || req.createdAt;
        if (!reqDateStr) return false;
        const itemDate = new Date(reqDateStr).toISOString().split('T')[0];

        if (startDate && itemDate < startDate) return false;
        if (endDate && itemDate > endDate) return false;
      }

      return true;
    });
  }, [requests, searchTicket, statusFilter, channelFilter, startDate, endDate]);

  return (
    <div className="p-4 animate-in fade-in duration-300 font-sans antialiased text-slate-700 tracking-normal bg-white">
      {/* Title Bar */}
      <div className="mb-4 flex justify-between items-end px-1 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Maintenance Jobs</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Task Allocation & Operational Tracking</p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Records: {filteredRequests.length} of {requests.length}
        </p>
      </div>

      {/* 🔍 FILTER TOOLBAR */}
      <div className="bg-slate-50 border border-slate-200 p-3 mb-4 rounded-xl flex flex-wrap items-center gap-3">
        
        {/* Ticket ID Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Ticket, Assignee, Dept..."
            value={searchTicket}
            onChange={(e) => setSearchTicket(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 transition-all uppercase font-medium"
          />
        </div>

        {/* Status Filter */}
        <div className="w-[130px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-slate-400 uppercase font-medium cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft / Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* 💡 Channel Filter (Staff vs Provider) */}
        <div className="w-[140px]">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 outline-none focus:border-slate-400 uppercase font-medium cursor-pointer"
          >
            <option value="ALL">All Channels</option>
            <option value="INTERNAL">Internal Staff</option>
            <option value="EXTERNAL">Service Provider</option>
          </select>
        </div>

        {/* Date From */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer"
          />
        </div>

        {/* Date To */}
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 border border-slate-200 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs text-slate-700 outline-none bg-transparent cursor-pointer"
          />
        </div>

        {/* Reset Button */}
        {(searchTicket || statusFilter !== 'ALL' || channelFilter !== 'ALL' || startDate || endDate) && (
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            title="Reset All Filters"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {/* Table Registry Container */}
      <div className="bg-white border border-slate-200 overflow-hidden shadow-none rounded-none">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">ID</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Description</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Department</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Assigned To</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200 text-center">Channel</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase border-r border-slate-200">Date</th>
              <th className="px-4 py-3 text-[10px] font-bold uppercase border-r border-slate-200">Status</th>
              <th className="px-4 py-2.5 text-[10px] font-bold uppercase text-center">Action</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-normal tracking-normal">
            {filteredRequests.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold uppercase tracking-wider text-xs">
                  No matching tickets found
                </td>
              </tr>
            ) : (
              filteredRequests.map((req) => {
                const style = rowStyles[req.status] || rowStyles.default;
                const isExternal = Boolean(
                  req.assignType === 'EXTERNAL' ||
                  (req.assignedTo && (req.assignedTo.includes('[') || req.assignedTo.includes('NIC:')))
                );

                return (
                  <tr 
                    key={req._id} 
                    style={{ backgroundColor: style.bg, color: style.text }}
                    className="border-b border-slate-200 transition-all hover:brightness-98 cursor-pointer"
                    onClick={() => setSelectedJob(req)}
                  >
                    <td className="px-4 py-2 font-semibold border-r border-slate-200/60 font-mono tracking-wide">{req.tid}</td>
                    <td className="px-4 py-2 font-semibold uppercase border-r border-slate-200/60">{req.title || req.description}</td>
                    <td className="px-4 py-2 font-semibold uppercase border-r border-slate-200/60">{req.department || '---'}</td>
                    
                    {/* Assigned Personnel */}
                    <td className="px-4 py-2 font-semibold uppercase border-r border-slate-200/60">
                      {req.assignedTo || 'Unassigned'}
                    </td>

                    {/* 💡 Channel Badge (Staff vs Provider) */}
                    <td className="px-3 py-2 text-center border-r border-slate-200/60">
                      {req.assignedTo ? (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          isExternal 
                            ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}>
                          {isExternal ? <Truck size={10} /> : <Users size={10} />}
                          {isExternal ? 'Provider' : 'Staff'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">---</span>
                      )}
                    </td>

                    <td className="px-4 py-2 border-r border-slate-200/60 font-mono text-slate-600">
                      {req.date ? new Date(req.date).toISOString().split('T')[0] : 'Date Not Set'}
                    </td>
                    <td className="px-4 py-2 font-bold uppercase border-r border-slate-200/60">{req.status === 'Assign Pending' ? 'DRAFT' : req.status}</td>
                    <td className="px-4 py-2 text-center font-bold text-[9px] uppercase tracking-wider opacity-60 text-slate-700 underline">
                      View Details
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <JobDetailsModal 
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        job={selectedJob}
        staffList={staffList}
        serviceProviders={serviceProviders}
        onAssign={handleAssign}
        onAdminComplete={handleAdminComplete}
        userRole={user?.role}
      />
    </div>
  );
};

export default MaintenanceView;