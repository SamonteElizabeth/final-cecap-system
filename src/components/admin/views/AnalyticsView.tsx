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
  Search,
  X,
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
  BILL_PAYMENT_STATUS_DATA,
  getBillPaymentCustomers,
} from '../../../data/adminMockData';

// Paid / Unpaid colours validated for colour-blind separation; icons + labels carry the meaning too
const PAYMENT_STATUS_SERIES = [
  { key: 'Paid', color: '#FDD9C2', icon: CheckCircle2 },
  { key: 'Unpaid', color: '#FF5401', icon: Clock },
] as const;

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [paymentStatusView, setPaymentStatusView] = useState<'chart' | 'table'>('chart');

  const latestPaymentStatus = BILL_PAYMENT_STATUS_DATA[BILL_PAYMENT_STATUS_DATA.length - 1];
  const latestBilled = latestPaymentStatus.Paid + latestPaymentStatus.Unpaid;
  const latestPaidRate = ((latestPaymentStatus.Paid / latestBilled) * 100).toFixed(1);

  // Customer list opened by clicking a Paid / Unpaid bar, summary row or table cell
  const [paymentCustomersView, setPaymentCustomersView] = useState<{ month: string; status: 'Paid' | 'Unpaid' } | null>(null);
  const [paymentCustomerSearch, setPaymentCustomerSearch] = useState('');

  const openPaymentCustomers = (month: string, status: 'Paid' | 'Unpaid') => {
    if (!month) return;
    setPaymentCustomerSearch('');
    setPaymentCustomersView({ month, status });
  };

  const paymentCustomers = paymentCustomersView
    ? getBillPaymentCustomers(paymentCustomersView.month, paymentCustomersView.status).filter(c => {
        const q = paymentCustomerSearch.trim().toLowerCase();
        return !q || c.name.toLowerCase().includes(q) || c.accountNumber.includes(q);
      })
    : [];
  const paymentCustomersTotal = paymentCustomersView
    ? BILL_PAYMENT_STATUS_DATA.find(d => d.month === paymentCustomersView.month)?.[paymentCustomersView.status] ?? 0
    : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Top Controls: Date Range Filter & Quick Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <h2 className="text-base md:text-lg font-extrabold text-[#2B2B2B]">Executive Performance Analytics</h2>

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
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Customer Registration Trend</h3>
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
          <h3 className="font-extrabold text-sm text-[#2B2B2B]">Ticket Status Distribution</h3>

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
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Payment Collection Overview (₱ Millions)</h3>
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
                <p className="text-xs font-bold text-[#2B2B2B]">Dominant Payment Channel</p>
                <span className="text-sm font-extrabold text-emerald-600">GCash (62.4%)</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                <p className="text-xs font-bold text-[#2B2B2B]">Substation Grid Reliability</p>
                <span className="text-sm font-extrabold text-blue-600">99.98% Uptime</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <p className="text-xs font-bold text-[#2B2B2B]">Active Grid Interruptions</p>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  0 Active Outages
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Payment Status (Stacked Bar) */}
        <div className="lg:col-span-12 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold text-sm text-[#2B2B2B]">Bill Payment Status</h3>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
              {(['chart', 'table'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setPaymentStatusView(view)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-all cursor-pointer ${
                    paymentStatusView === view ? 'bg-white text-[#2B2B2B] shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Latest month summary (doubles as the legend) */}
            <div className="lg:col-span-3 space-y-4">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{latestPaymentStatus.month} 2026 Paid Rate</p>
                <p className="text-3xl font-black text-[#2B2B2B] mt-1">{latestPaidRate}%</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  of {latestBilled.toLocaleString()} bills issued
                </p>
              </div>
              <div className="space-y-2">
                {PAYMENT_STATUS_SERIES.map(({ key, color, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => openPaymentCustomers(latestPaymentStatus.month, key)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-[#FF5401]/40 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2 text-xs font-bold text-[#2B2B2B]">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      {key}
                    </span>
                    <span className="text-sm font-extrabold text-[#2B2B2B]">
                      {latestPaymentStatus[key].toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-9">
              {paymentStatusView === 'chart' ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={BILL_PAYMENT_STATUS_DATA} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                      <YAxis
                        stroke="#64748B"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
                      />
                      <Tooltip
                        cursor={{ fill: '#F8FAFC' }}
                        contentStyle={{ backgroundColor: '#1E293B', color: '#FFF', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#FFF' }}
                        formatter={(value, name, item) => {
                          const { Paid, Unpaid } = item.payload as { Paid: number; Unpaid: number };
                          const count = Number(value);
                          return [`${count.toLocaleString()} (${((count / (Paid + Unpaid)) * 100).toFixed(1)}%)`, name];
                        }}
                      />
                      <Bar
                        dataKey="Paid"
                        stackId="status"
                        fill={PAYMENT_STATUS_SERIES[0].color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        maxBarSize={48}
                        cursor="pointer"
                        onClick={(entry: { month?: string; payload?: { month: string } }) => openPaymentCustomers(entry.payload?.month ?? entry.month ?? '', 'Paid')}
                      />
                      <Bar
                        dataKey="Unpaid"
                        stackId="status"
                        fill={PAYMENT_STATUS_SERIES[1].color}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={48}
                        cursor="pointer"
                        onClick={(entry: { month?: string; payload?: { month: string } }) => openPaymentCustomers(entry.payload?.month ?? entry.month ?? '', 'Unpaid')}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-100">
                        <th className="py-2 font-bold">Month</th>
                        <th className="py-2 font-bold text-right">Paid</th>
                        <th className="py-2 font-bold text-right">Unpaid</th>
                        <th className="py-2 font-bold text-right">Paid Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {BILL_PAYMENT_STATUS_DATA.map(row => (
                        <tr key={row.month} className="text-[#2B2B2B]">
                          <td className="py-2 font-bold">{row.month}</td>
                          {PAYMENT_STATUS_SERIES.map(({ key }) => (
                            <td key={key} className="py-2 text-right">
                              <button
                                onClick={() => openPaymentCustomers(row.month, key)}
                                className="font-semibold hover:text-[#FF5401] hover:underline cursor-pointer"
                              >
                                {row[key].toLocaleString()}
                              </button>
                            </td>
                          ))}
                          <td className="py-2 text-right font-bold">
                            {((row.Paid / (row.Paid + row.Unpaid)) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paid / Unpaid Customer List */}
      {paymentCustomersView && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPaymentCustomersView(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-[#E5E7EB]"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-[#2B2B2B] flex items-center gap-2">
                    {paymentCustomersView.status === 'Paid' ? (
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-[#FF5401]" />
                    )}
                    {paymentCustomersView.status} Customers
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {paymentCustomersView.month} 2026 · {paymentCustomersTotal.toLocaleString()} accounts
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                    {PAYMENT_STATUS_SERIES.map(({ key }) => (
                      <button
                        key={key}
                        onClick={() => setPaymentCustomersView({ ...paymentCustomersView, status: key })}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          paymentCustomersView.status === key ? 'bg-white text-[#2B2B2B] shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPaymentCustomersView(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={paymentCustomerSearch}
                  onChange={e => setPaymentCustomerSearch(e.target.value)}
                  placeholder="Search name or account number"
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-[#2B2B2B] focus:outline-none focus:border-[#FF5401]"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {paymentCustomers.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500 font-medium">No customers found</p>
              ) : (
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="text-left text-slate-500 border-b border-slate-100">
                      <th className="py-2.5 px-5 font-bold">Customer</th>
                      <th className="py-2.5 px-3 font-bold hidden sm:table-cell">Type</th>
                      <th className="py-2.5 px-3 font-bold text-right">Amount</th>
                      <th className="py-2.5 px-5 font-bold text-right">
                        {paymentCustomersView.status === 'Paid' ? 'Paid On' : 'Due Date'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentCustomers.map(c => (
                      <tr key={c.accountNumber} className="text-[#2B2B2B] hover:bg-[#F8FAFC]">
                        <td className="py-2.5 px-5">
                          <p className="font-bold">{c.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">#{c.accountNumber}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 hidden sm:table-cell">{c.serviceType}</td>
                        <td className="py-2.5 px-3 text-right font-bold">
                          ₱{c.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-5 text-right">
                          {c.status === 'Paid' ? (
                            <>
                              <p className="font-medium">{c.paymentDate}</p>
                              <p className="text-[11px] text-slate-500">{c.paymentChannel}</p>
                            </>
                          ) : (
                            <p className="font-medium text-[#FF5401]">{c.dueDate}</p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-500 font-medium">
              Showing {paymentCustomers.length} of {paymentCustomersTotal.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities Feed */}
      <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-[#2B2B2B]">Recent Operations Activity Log</h3>
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
