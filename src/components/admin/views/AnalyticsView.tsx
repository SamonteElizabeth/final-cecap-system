import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  HelpCircle,
  TrendingUp,
  Activity,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  REGISTRATION_TREND_DATA,
  PAYMENT_COLLECTION_DATA,
  TICKET_DISTRIBUTION_DATA,
  RECENT_ACTIVITIES_LOG,
} from '../../../data/adminMockData';

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Controls: Date Range Filter & Quick Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div>
          <h2 className="text-base md:text-lg font-extrabold text-[#2B2B2B]">Executive Performance Analytics</h2>
          <p className="text-xs text-slate-500">Real-time overview of customer registrations, grid payments, and ticketing metrics.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] p-1.5 rounded-xl">
          <Calendar className="w-4 h-4 text-[#FF5401] ml-2" />
          <span className="text-xs font-bold text-slate-600">Period:</span>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
            className="bg-transparent text-xs font-extrabold text-[#2B2B2B] focus:outline-none cursor-pointer pr-2"
          >
            <option value="Today">Today (Realtime)</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter (Q3 2026)</option>
            <option value="Year to Date">Year to Date (2026)</option>
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Registered Customers */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3 relative overflow-hidden hover:border-[#FF5401]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5401] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2B2B2B]">148,290</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+12.4% MoM Growth</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Active Customers */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3 relative overflow-hidden hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Service Accounts</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2B2B2B]">142,850</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              96.3% Active Grid Connections
            </div>
          </div>
        </div>

        {/* KPI 3: Total Payment Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3 relative overflow-hidden hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payments Collected</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2B2B2B]">₱48,520,180</div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              34,210 Settled Receipts
            </div>
          </div>
        </div>

        {/* KPI 4: Open Support Tickets */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-3 relative overflow-hidden hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Support Tickets</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#FF5401] flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-[#2B2B2B]">18 Pending</div>
            <div className="text-xs text-emerald-600 font-bold mt-1">
              94.2% Resolution SLA Met
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Registration Trend (Line Chart) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#2B2B2B]">Customer Registration Trend</h3>
              <p className="text-xs text-slate-500">New customer sign-ups by service category over time</p>
            </div>
            <span className="text-xs font-extrabold text-[#FF5401] bg-orange-50 px-2.5 py-1 rounded-lg">
              Monthly Sign-ups
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REGISTRATION_TREND_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Residential" stroke="#FF5401" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Commercial" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Industrial" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Support Ticket Distribution (Donut Chart) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Ticket Status Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of active and resolved concerns</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TICKET_DISTRIBUTION_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {TICKET_DISTRIBUTION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
            {TICKET_DISTRIBUTION_DATA.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 font-medium truncate">{item.name}:</span>
                <strong className="text-[#2B2B2B]">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Collection Overview (Bar Chart) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-[#2B2B2B]">Payment Collection Overview (₱ Millions)</h3>
              <p className="text-xs text-slate-500">Comparison of collection volumes across integrated payment channels</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Channel Breakdown
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PAYMENT_COLLECTION_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="GCash" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Maya" fill="#FF5401" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ECPay" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Bank" fill="#64748B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Statistics Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Quick Operating Statistics</h3>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-orange-50/60 border border-orange-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2B2B2B]">Avg Ticket Resolution Time</p>
                  <p className="text-[11px] text-slate-500">Target SLA: 12 Hours</p>
                </div>
                <span className="text-sm font-extrabold text-[#FF5401]">3.2 Hours</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2B2B2B]">Dominant Payment Channel</p>
                  <p className="text-[11px] text-slate-500">Digital Gateway Leader</p>
                </div>
                <span className="text-sm font-extrabold text-emerald-600">GCash (62.4%)</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2B2B2B]">Substation Grid Reliability</p>
                  <p className="text-[11px] text-slate-500">Clark Freeport Zone</p>
                </div>
                <span className="text-sm font-extrabold text-blue-600">99.98% Uptime</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#2B2B2B]">Active Grid Interruptions</p>
                  <p className="text-[11px] text-slate-500">Current Feeder Alerts</p>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  0 Active Outages
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities Feed */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Recent Operations Activity Log</h3>
            <p className="text-xs text-slate-500">Audit timeline of recent administrative actions and system events</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Live Audit Feed</span>
        </div>

        <div className="divide-y divide-slate-100">
          {RECENT_ACTIVITIES_LOG.map(act => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#FF5401] flex items-center justify-center shrink-0 font-bold text-xs">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#2B2B2B]">
                    {act.user} <span className="font-bold text-slate-500">• {act.action}</span>
                  </p>
                  <p className="text-[11px] text-slate-600">{act.details}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
