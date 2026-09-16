import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Truck, Plus, Trash2, Search, Phone, CreditCard, Wrench, MapPin } from 'lucide-react';

const ServiceProviderMaster = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    serviceType: 'AC Repair',
    contactPerson: '',
    phone: '',
    email: '',
    address: ''
  });

  const systemColor = "#A47148";

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await axios.get('http://192.168.1.2:5000/api/service-providers');
      setProviders(res.data || []);
    } catch (err) {
      console.error("Error fetching service providers", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.nic.trim() || !formData.phone.trim()) {
      return toast.error("Please fill Name, NIC and Phone number!");
    }

    setLoading(true);
    const t = toast.loading("Registering Service Provider...");

    try {
      await axios.post('http://192.168.1.2:5000/api/service-providers', formData);
      toast.success("Service Provider Registered Successfully!", { id: t });
      setFormData({
        name: '',
        nic: '',
        serviceType: 'AC Repair',
        contactPerson: '',
        phone: '',
        email: '',
        address: ''
      });
      fetchProviders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to register", { id: t });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await axios.delete(`http://192.168.1.2:5000/api/service-providers/${id}`);
      toast.success("Service Provider removed");
      fetchProviders();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.nic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-300 font-sans text-slate-800 bg-[#EFEFEF] min-h-screen">
      
      {/* 1. REGISTRATION FORM */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="p-3 bg-amber-50 text-[#A47148] rounded-2xl">
            <Truck size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">External Service Provider Master</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Third-Party Maintenance Technicians & Contractors</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Provider Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Service Provider / Company Name *</label>
            <input 
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase outline-none focus:border-[#A47148]"
              placeholder="e.g. COOL AIR ENGINEERING"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* 💡 NIC NUMBER FIELD */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">National ID (NIC) *</label>
            <div className="relative flex items-center">
              <CreditCard size={14} className="absolute left-3 text-slate-400" />
              <input 
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase outline-none focus:border-[#A47148]"
                placeholder="e.g. 199012345678 / 901234567V"
                value={formData.nic}
                onChange={(e) => setFormData({...formData, nic: e.target.value})}
              />
            </div>
          </div>

          {/* Service Specialization */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Specialization / Type *</label>
            <select 
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A47148] cursor-pointer"
              value={formData.serviceType}
              onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
            >
              <option value="AC Repair">AC & Refrigeration</option>
              <option value="Electrical">Electrical Works</option>
              <option value="Sewing Machine Repair">Sewing Machinery</option>
              <option value="Boiler & Steam">Boiler & Steam Systems</option>
              <option value="Plumbing">Plumbing & Water Systems</option>
              <option value="Compressor & Air">Pneumatics & Compressors</option>
              <option value="Generator & Power">Generators & Power</option>
              <option value="Civil & Carpentry">Civil & Infrastructure</option>
              <option value="General Service">General Maintenance</option>
            </select>
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Contact Person / Technician</label>
            <input 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A47148]"
              placeholder="e.g. Mr. Kamal Perera"
              value={formData.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Phone / Mobile *</label>
            <div className="relative flex items-center">
              <Phone size={14} className="absolute left-3 text-slate-400" />
              <input 
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:border-[#A47148]"
                placeholder="07X-XXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          {/* Address / Location */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Address / Workshop Area</label>
            <input 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A47148]"
              placeholder="e.g. Colombo Road, Katunayake"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          <div className="md:col-span-3 pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#A47148] hover:bg-[#8d5e38] text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} /> Register Service Provider
            </button>
          </div>
        </form>
      </div>

      {/* 2. DIRECTORY TABLE */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex justify-between items-center px-2">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Registered Service Providers Directory</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total: {filteredProviders.length}</p>
          </div>

          {/* Search Box */}
          <div className="relative w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by Name, NIC, Code or Type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-[#A47148]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase">
                <th className="px-4 py-3 border-r border-slate-200 w-24">Code</th>
                <th className="px-4 py-3 border-r border-slate-200">Name</th>
                <th className="px-4 py-3 border-r border-slate-200 w-32">NIC No</th>
                <th className="px-4 py-3 border-r border-slate-200 w-36">Specialization</th>
                <th className="px-4 py-3 border-r border-slate-200 w-32">Contact No</th>
                <th className="px-4 py-3 text-center w-20">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-xs uppercase font-semibold">
                    No Service Providers Registered
                  </td>
                </tr>
              ) : (
                filteredProviders.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-blue-600 border-r border-slate-200">{p.code}</td>
                    <td className="px-4 py-2.5 uppercase font-bold text-slate-800 border-r border-slate-200">{p.name}</td>
                    {/* NIC Data Display */}
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-700 border-r border-slate-200">{p.nic}</td>
                    <td className="px-4 py-2.5 text-slate-600 border-r border-slate-200 text-[11px] font-medium">{p.serviceType}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 border-r border-slate-200">{p.phone}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button 
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Provider"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ServiceProviderMaster;