import React, { useState, useEffect } from 'react';

const LeadsCRM = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/admin/dashboard/activity')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-margin-desktop max-w-container-max mx-auto space-y-stack-lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">Leads CRM</h1>
          <p className="font-body-md text-on-surface-variant">Manage and track all your incoming prospects.</p>
        </div>
        <button className="px-6 py-3 bg-brand-orange text-white font-button uppercase tracking-wide hover:opacity-90 transition-opacity">
          Add Lead
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-surface border border-outline-variant p-stack-md flex flex-col gap-6">
        <div className="flex items-center bg-surface-container-low border border-outline-variant rounded px-4 py-3">
          <span className="material-symbols-outlined text-outline">search</span>
          <input 
            type="text" 
            placeholder="Search by name, phone, or service..." 
            className="bg-transparent border-none outline-none ml-3 font-body-md text-on-surface w-full placeholder:text-outline"
          />
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <button className="px-4 py-2 font-label-md bg-primary-container text-on-primary-container rounded border border-primary-container whitespace-nowrap transition-colors">
            All Leads
          </button>
          <button className="px-4 py-2 font-label-md border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low whitespace-nowrap transition-colors">
            New
          </button>
          <button className="px-4 py-2 font-label-md border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low whitespace-nowrap transition-colors">
            In Progress
          </button>
          <button className="px-4 py-2 font-label-md border border-outline-variant text-on-surface-variant rounded hover:bg-surface-container-low whitespace-nowrap transition-colors">
            Converted
          </button>
          <button className="p-2 ml-auto text-on-surface-variant hover:bg-surface-container-low rounded transition-colors shrink-0 flex items-center justify-center border border-transparent">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-stack-md text-on-surface-variant font-body-md animate-pulse">Loading leads...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {leads.map((lead, idx) => (
            <div key={idx} className="bg-surface border border-outline-variant p-5 flex flex-col hover:border-primary-container transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-label-md text-primary text-lg truncate pr-2">{lead.customer}</h3>
                <button className="text-on-surface-variant hover:bg-surface-container-low p-1 rounded transition-colors shrink-0 flex items-center">
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-5">
                <span className={`px-2 py-1 text-[12px] font-label-md rounded border uppercase tracking-wider ${
                  lead.status === 'Nuevo' 
                    ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant border-tertiary-fixed-dim' 
                    : 'bg-primary-fixed text-on-primary-fixed-variant border-primary-fixed-dim'
                }`}>
                  {lead.status}
                </span>
                <span className="px-2 py-1 text-[12px] font-label-md rounded border bg-surface-container-high text-on-surface-variant border-outline-variant uppercase tracking-wider">
                  {lead.service}
                </span>
              </div>

              <div className="flex flex-col gap-3 mb-6 mt-auto">
                <div className="flex items-center gap-3 font-body-md text-on-surface-variant text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">phone</span>
                  <span>{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 font-body-md text-on-surface-variant text-[14px]">
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  <span className="truncate">{lead.email || 'No email'}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-outline-variant">
                <button className="px-4 py-2 font-button text-[14px] flex-1 border border-primary-container text-primary-container hover:bg-primary-container hover:text-white transition-all">
                  View Details
                </button>
                <button className="px-4 py-2 bg-brand-orange text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Open WhatsApp Chat">
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                </button>
              </div>
            </div>
          ))}
          {leads.length === 0 && (
            <p className="col-span-full text-center font-body-md text-on-surface-variant py-10">No leads found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeadsCRM;
