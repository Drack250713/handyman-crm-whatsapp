import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const DashboardMain = () => {
  const [stats, setStats] = useState({
    total_leads: 0,
    ai_interactions: 0,
    conversion_rate: "0%",
    performance_trend: [],
    recent_activity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/admin/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-margin-desktop text-on-surface-variant font-body-md animate-pulse">Loading dashboard data...</div>;
  }

  return (
    <div className="p-margin-desktop max-w-container-max mx-auto space-y-stack-lg">
      
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {/* Total Leads */}
        <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between hover:border-primary-container transition-all group">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Total Leads</span>
            <span className="material-symbols-outlined text-on-primary-container" data-icon="trending_up">trending_up</span>
          </div>
          <div className="mt-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">{stats.total_leads}</h2>
            <div className="flex items-center gap-1 mt-2 text-green-600 font-label-md">
              <span>+12%</span>
              <span className="text-[12px] text-on-surface-variant font-normal">vs last month</span>
            </div>
          </div>
        </div>

        {/* AI Interactions */}
        <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between hover:border-primary-container transition-all">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">AI Interactions</span>
            <span className="material-symbols-outlined text-on-primary-container" data-icon="smart_toy">smart_toy</span>
          </div>
          <div className="mt-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">{stats.ai_interactions}</h2>
            <div className="flex items-center gap-1 mt-2 text-primary font-label-md">
              <span className="text-[12px] text-on-surface-variant font-normal">Average 40 daily</span>
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="bg-surface border border-outline-variant p-stack-md flex flex-col justify-between hover:border-primary-container transition-all">
          <div className="flex justify-between items-start">
            <span className="font-label-md text-on-surface-variant uppercase tracking-wider">Conversion Rate</span>
            <span className="material-symbols-outlined text-brand-orange" data-icon="bolt">bolt</span>
          </div>
          <div className="mt-4">
            <h2 className="font-headline-lg text-headline-lg text-primary">{stats.conversion_rate}</h2>
            <div className="w-full bg-surface-container h-1 mt-3 rounded-full overflow-hidden">
              <div 
                className="bg-brand-orange h-full" 
                style={{ width: stats.conversion_rate.includes('%') ? stats.conversion_rate : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Insights Section (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        
        {/* Performance Chart area */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant p-stack-md flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-primary">Performance Trend</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 font-label-md rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">7 Days</button>
              <button className="px-3 py-1 font-label-md rounded border border-primary-container bg-primary-container text-on-primary transition-colors">30 Days</button>
            </div>
          </div>
          <div className="chart-container flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.performance_trend}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#002147" stopOpacity={0.1}/>
                    <stop offset="100%" stopColor="#002147" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e2e1" vertical={false} />
                <XAxis dataKey="date" stroke="#74777f" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#74777f" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #c4c6cf', borderRadius: '8px', color: '#1c1b1b' }}
                />
                <Area type="monotone" dataKey="leads" stroke="#002147" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" activeDot={{ r: 6, fill: '#cf7000', stroke: 'none' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-surface border border-outline-variant p-stack-md flex flex-col">
          <h3 className="font-headline-md text-primary mb-6">Recent Activity</h3>
          <div className="flex-grow space-y-4">
            {stats.recent_activity.slice(0, 4).map((activity, idx) => (
              <div key={idx} className="flex gap-4 p-3 hover:bg-surface-container-low transition-colors rounded-lg group cursor-pointer">
                <div className="w-10 h-10 shrink-0 rounded bg-primary-container/10 flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-on-surface truncate">New lead from {activity.name}</p>
                  <p className="text-[12px] text-on-surface-variant truncate">
                    {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {activity.service}
                  </p>
                </div>
              </div>
            ))}
            {stats.recent_activity.length === 0 && (
               <p className="font-body-md text-on-surface-variant">No recent activity.</p>
            )}
          </div>
          <button className="mt-6 font-button text-brand-orange hover:underline text-left flex items-center gap-2">
            View All Activity <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Featured Service Promotion Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="relative min-h-[320px] bg-primary flex flex-col justify-end p-stack-md group overflow-hidden">
          <div 
            className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCU4MSNHwCGSlfQL_Iv8EVhoi5E7GFVShYlVpdWnYidVXhSQY3tdLgVgoqveo2ZyKtj_hyKCDX1o5DWMKjcAxAVsCyymR4tfoHaZ7xM8RPCVbgNxiZ5fdlmD5GHg1fHdYV7qtsv0IAfz9ArHYhN2lqudHoJvaPg5al81sm-EW9fsc307s3AQR_SHgStUeXvSRuJopUIf033OWd8v577Hpniq6sKVIRLT7xr7eDXD0LY6gip_kmnoaVaV6y3sRy8FDUpc6LGkMsvowAw')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent opacity-80"></div>
          <div className="relative z-10 space-y-2">
            <span className="inline-block px-3 py-1 bg-brand-orange text-white font-label-md text-[12px] uppercase tracking-widest">New Capability</span>
            <h4 className="font-headline-md text-white">Advanced HVAC Diagnostics</h4>
            <p className="text-on-primary-container max-w-sm">Our AI can now handle complex troubleshooting queries for high-end cooling systems.</p>
            <button className="mt-4 px-6 py-3 bg-brand-orange text-white font-button hover:opacity-90 transition-all uppercase tracking-wide">Update Bot Training</button>
          </div>
        </div>

        <div className="bg-surface-container-low border border-outline-variant p-stack-md flex flex-col justify-center">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-1 bg-brand-orange"></div>
            <h4 className="font-headline-md text-primary">Optimize Your Conversion</h4>
            <p className="font-body-md text-on-surface-variant">Your current booking conversion is up 15% from last week. Based on current traffic, we suggest adjusting AI responses for 'Kitchen Remodel' leads to focus on immediate quote generation.</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="px-6 py-3 border border-primary-container text-primary-container font-button hover:bg-primary-container hover:text-white transition-all">View Analytics</button>
              <button className="px-6 py-3 text-brand-orange font-button flex items-center gap-2 hover:gap-3 transition-all">
                  Adjust Strategy <span className="material-symbols-outlined">bolt</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DashboardMain;
