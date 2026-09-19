import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Wrench 
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between transition-transform hover:scale-[1.01] duration-300">
    <div>
      <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-[0.15em] mb-1 font-sans">
        {title}
      </p>
      <h3 className="text-3xl font-medium text-slate-800 font-sans tracking-tight">
        {value}
      </h3>
    </div>
    <div className="p-4 rounded-2xl" style={{ backgroundColor: `${color}10`, color: color }}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = ({ requests = [] }) => {
  const systemColor = "#A47148";
  const [timeRange, setTimeRange] = useState('30'); // '7' or '30' days

  // Standard Stat Colors
  const colors = {
    draft: '#f59e0b',     // Amber / Pending
    assigned: '#3b82f6',  // Blue / Active
    completed: '#10b981'  // Emerald / Completed
  };

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'Assign Pending' || r.status === 'DRAFT').length,
    active: requests.filter(r => r.status === 'Assigned').length,
    completed: requests.filter(r => r.status === 'Completed').length,
  }), [requests]);

  // 💡 Stacked Status Counts per Day calculation
  const chartDays = useMemo(() => {
    const daysCount = parseInt(timeRange, 10);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayNames[d.getDay()];

      // අදාළ දිනට අයත් tickets සොයා ගැනීම
      const dayRequests = requests.filter(req => {
        const itemDate = req.date || req.createdAt;
        if (!itemDate) return false;
        return new Date(itemDate).toISOString().split('T')[0] === dateStr;
      });

      const draftCount = dayRequests.filter(r => r.status === 'Assign Pending' || r.status === 'DRAFT').length;
      const assignedCount = dayRequests.filter(r => r.status === 'Assigned').length;
      const completedCount = dayRequests.filter(r => r.status === 'Completed').length;
      const totalDayCount = dayRequests.length;

      result.push({
        label: daysCount === 7 ? dayLabel : `${d.getDate()}/${d.getMonth() + 1}`,
        date: dateStr,
        total: totalDayCount,
        draft: draftCount,
        assigned: assignedCount,
        completed: completedCount,
        isToday: i === 0
      });
    }

    // Stacked Bar එකේ සම්පූර්ණ උස සදහා උපරිම ප්‍රමාණය සෙවීම
    const maxTotal = Math.max(...result.map(d => d.total), 1);

    return result.map(item => {
      // දවස ඇතුළත එක් එක් තත්වයේ ප්‍රතිශතය (0 නම් සම්පූර්ණ උස 8% ක placeholder එකක් ලෙස තබයි)
      const overallHeightPercent = item.total === 0 ? 8 : Math.max(Math.round((item.total / maxTotal) * 100), 16);
      
      const draftPercent = item.total > 0 ? (item.draft / item.total) * 100 : 0;
      const assignedPercent = item.total > 0 ? (item.assigned / item.total) * 100 : 0;
      const completedPercent = item.total > 0 ? (item.completed / item.total) * 100 : 0;

      return {
        ...item,
        overallHeightPercent,
        draftPercent,
        assignedPercent,
        completedPercent
      };
    });
  }, [requests, timeRange]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 font-sans">
      
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          System Overview
        </h1>
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">
          Real-time maintenance analytics and job tracking.
        </p>
      </header>

      {/* 4 Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Requests" value={stats.total} icon={BarChart3} color="#3b82f6" />
        <StatCard title="Assign Pending" value={stats.pending} icon={AlertCircle} color={colors.draft} />
        <StatCard title="Assigned Jobs" value={stats.active} icon={Clock} color={colors.assigned} />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color={colors.completed} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* STACKED WORKLOAD DISTRIBUTION CARD */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-slate-700 flex items-center gap-2 uppercase text-[11px] tracking-widest">
                <TrendingUp size={18} style={{ color: systemColor }} />
                Workload Distribution
              </h3>
              <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">
                Daily task distribution by workflow status
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* 💡 STATUS COLOR LEGEND */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.draft }} />
                  Pending
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.assigned }} />
                  Assigned
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.completed }} />
                  Completed
                </span>
              </div>

              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-[10px] font-semibold uppercase tracking-wider bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-slate-600 cursor-pointer"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* 💡 STACKED BARS CONTAINER */}
          <div className="h-64 flex items-end justify-between gap-2 px-1 pt-6">
            {chartDays.map((item, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end items-center gap-2.5 group">
                
                {/* Main Bar Wrapper */}
                <div 
                  className="w-full transition-all duration-500 rounded-xl relative cursor-pointer flex flex-col-reverse overflow-hidden"
                  style={{ 
                    height: `${item.overallHeightPercent}%`,
                    backgroundColor: item.total === 0 ? '#f1f5f9' : 'transparent'
                  }}
                >
                  {/* Status Segment 1: Completed (Bottom) */}
                  {item.completed > 0 && (
                    <div 
                      style={{ 
                        height: `${item.completedPercent}%`, 
                        backgroundColor: colors.completed 
                      }} 
                      className="w-full transition-all"
                    />
                  )}

                  {/* Status Segment 2: Assigned (Middle) */}
                  {item.assigned > 0 && (
                    <div 
                      style={{ 
                        height: `${item.assignedPercent}%`, 
                        backgroundColor: colors.assigned 
                      }} 
                      className="w-full transition-all"
                    />
                  )}

                  {/* Status Segment 3: Draft/Pending (Top) */}
                  {item.draft > 0 && (
                    <div 
                      style={{ 
                        height: `${item.draftPercent}%`, 
                        backgroundColor: colors.draft 
                      }} 
                      className="w-full transition-all"
                    />
                  )}

                  {/* 💡 Multi-Status Detailed Hover Tooltip */}
                  <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-medium py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl whitespace-nowrap space-y-1">
                    <p className="font-bold border-b border-slate-700 pb-1 text-slate-300 uppercase">{item.date}</p>
                    <p className="text-amber-400">Pending: {item.draft}</p>
                    <p className="text-blue-400">Assigned: {item.assigned}</p>
                    <p className="text-emerald-400">Completed: {item.completed}</p>
                    <p className="font-extrabold text-white pt-0.5 border-t border-slate-700">Total: {item.total}</p>
                  </div>
                </div>

                {/* Day Label */}
                <span className={`text-[9px] font-semibold uppercase shrink-0 ${
                  item.isToday ? 'text-slate-900 font-extrabold' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
          <h3 className="font-semibold text-slate-700 mb-8 uppercase text-[11px] tracking-widest">
            Recent Activity
          </h3>
          <div className="space-y-6 relative">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />

            {requests.length > 0 ? (
              requests.slice(0, 5).map((req, i) => (
                <div key={req._id || i} className="flex gap-4 items-start relative z-10">
                  <div 
                    className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm shrink-0 mt-0.5" 
                    style={{ 
                      backgroundColor: 
                        req.status === 'Completed' ? colors.completed : 
                        req.status === 'Assigned' ? colors.assigned : colors.draft 
                    }}
                  />
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-tight line-clamp-1">
                      {req.title || req.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase font-mono">
                        {req.tid}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span 
                        className="text-[9px] font-bold uppercase" 
                        style={{ 
                          color: 
                            req.status === 'Completed' ? colors.completed : 
                            req.status === 'Assigned' ? colors.assigned : colors.draft 
                        }}
                      >
                        {req.status === 'Assign Pending' ? 'DRAFT' : req.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Wrench size={32} className="text-slate-200 mb-4" />
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-widest">
                  No Active Jobs
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;