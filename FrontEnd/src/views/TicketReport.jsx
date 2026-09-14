import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Search, Printer, Download, RotateCcw, FileText } from 'lucide-react';

const TicketReport = () => {
  const [requests, setRequests] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const printRef = useRef();

  // Data Fetching
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [reqRes, staffRes] = await Promise.all([
        axios.get('http://192.168.1.2:5000/api/requests'),
        axios.get('http://192.168.1.2:5000/api/users/staff')
      ]);
      setRequests(reqRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err) {
      console.error("Error loading report data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredData = useMemo(() => {
    return requests.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL') {
        const itemStatus = item.status === 'Assign Pending' ? 'DRAFT' : item.status;
        if (statusFilter === 'DRAFT' && itemStatus !== 'DRAFT') return false;
        if (statusFilter !== 'DRAFT' && item.status !== statusFilter) return false;
      }

      // 2. Assigned Staff Filter
      if (staffFilter !== 'ALL') {
        if (!item.assignedTo || item.assignedTo.toLowerCase() !== staffFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Date Range Filter
      if (startDate || endDate) {
        const dateVal = item.date || item.createdAt;
        if (!dateVal) return false;
        const targetDate = new Date(dateVal).toISOString().split('T')[0];

        if (startDate && targetDate < startDate) return false;
        if (endDate && targetDate > endDate) return false;
      }

      return true;
    });
  }, [requests, statusFilter, staffFilter, startDate, endDate]);

  // Reset Filters
  const handleReset = () => {
    setStatusFilter('ALL');
    setStaffFilter('ALL');
    setStartDate('');
    setEndDate('');
  };

  // Print (PDF) Trigger
  const handlePrint = () => {
    window.print();
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ["ID,DESCRIPTION,ASSIGNED TO,DATE,STATUS"];
    const rows = filteredData.map(item => {
      const id = item.tid || '';
      const desc = `"${(item.title || item.description || '').replace(/"/g, '""')}"`;
      const assigned = `"${item.assignedTo || 'Unassigned'}"`;
      const date = item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A';
      const status = item.status === 'Assign Pending' ? 'DRAFT' : item.status;

      return [id, desc, assigned, date, status].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ticket_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 bg-white min-h-screen font-sans antialiased text-slate-800">
      
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200 mb-6 print:mb-2">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-slate-900 flex items-center gap-2">
            <FileText size={20} className="text-[#A06C3E]" /> Maintenance Ticket Report
          </h1>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-0.5">
            Operational Service Logs & Audit Registry
          </p>
        </div>

        {/* Print / Export Actions (Hidden on Print) */}
        <div className="flex gap-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#A06C3E] hover:bg-[#8A5A30] text-white text-xs font-bold uppercase rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer size={14} /> Print Report
          </button>
        </div>
      </div>

      {/* Filter Control Bar (Hidden on Print) */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 flex flex-wrap items-center gap-3 print:hidden">
        
        {/* Status */}
        <div className="min-w-[140px]">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium uppercase outline-none focus:border-slate-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft / Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Assigned Staff */}
        <div className="min-w-[170px]">
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Assigned Staff</label>
          <select
            value={staffFilter}
            onChange={(e) => setStaffFilter(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium uppercase outline-none focus:border-slate-500"
          >
            <option value="ALL">All Maintenance Staff</option>
            {staffList.map((s) => (
              <option key={s._id} value={s.username}>
                {s.username}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium outline-none focus:border-slate-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Date To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium outline-none focus:border-slate-500"
          />
        </div>

        {/* Reset Filter Button */}
        {(statusFilter !== 'ALL' || staffFilter !== 'ALL' || startDate || endDate) && (
          <div className="self-end">
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md text-xs font-bold uppercase transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        )}

        <div className="ml-auto self-end text-right">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Count:</span>{' '}
          <span className="text-xs font-extrabold text-slate-800">{filteredData.length}</span>
        </div>
      </div>

      {/* Print Meta Header (Visible ONLY when Printing) */}
      <div className="hidden print:block mb-4 border-b border-slate-300 pb-2">
        <div className="flex justify-between text-xs text-slate-600 font-semibold uppercase">
          <span>Generated On: {new Date().toLocaleString()}</span>
          <span>Filtered Count: {filteredData.length} Records</span>
        </div>
      </div>

      {/* Report Table Registry */}
      <div className="bg-white border border-slate-300 rounded-none overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase border-r border-slate-300 w-[120px]">ID</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase border-r border-slate-300">DESCRIPTION</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase border-r border-slate-300 w-[180px]">ASSIGNED TO</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase border-r border-slate-300 w-[120px]">DATE</th>
              <th className="px-4 py-2.5 text-[11px] font-bold uppercase w-[130px] text-center">STATUS</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400 uppercase font-semibold">
                  Generating Ticket Data...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400 uppercase font-semibold">
                  No tickets matched the specified criteria
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                const isDraft = item.status === 'Assign Pending' || item.status === 'DRAFT';
                const isCompleted = item.status === 'Completed';

                return (
                  <tr key={item._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono font-bold text-blue-600 border-r border-slate-200">
                      {item.tid}
                    </td>
                    <td className="px-4 py-2.5 uppercase font-medium text-slate-800 border-r border-slate-200">
                      {item.title || item.description || 'N/A'}
                    </td>
                    <td className="px-4 py-2.5 uppercase font-semibold text-slate-700 border-r border-slate-200">
                      {item.assignedTo || 'Unassigned'}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 border-r border-slate-200">
                      {item.date ? new Date(item.date).toISOString().split('T')[0] : 'N/A'}
                    </td>
                    <td className="px-4 py-2.5 text-center font-bold uppercase text-[10px]">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDraft
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isDraft ? 'DRAFT' : item.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default TicketReport;