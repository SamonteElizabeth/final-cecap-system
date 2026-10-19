import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { fetchConsumptionHistory } from '../../services/api';
import { ConsumptionData } from '../../types';
import {
  Zap,
  TrendingUp,
  Activity,
  CreditCard,
  Calendar,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from 'recharts';

export const ConsumptionView: React.FC = () => {
  const { selectedAccount, setActiveTab } = useApp();
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonthData, setSelectedMonthData] = useState<ConsumptionData | null>(null);
  const [consumptionList, setConsumptionList] = useState<ConsumptionData[]>([]);
  const [hoveredBar, setHoveredBar] = useState<ConsumptionData | null>(null);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchConsumptionHistory(selectedAccount.accountNumber).then(res => {
      if (res.consumption) {
        setConsumptionList(res.consumption);
      }
    });
  }, [selectedAccount]);

  // Extract available years dynamically from loaded consumption history
  const availableYears = useMemo(() => {
    if (!consumptionList.length) return ['2026', '2025', '2024'];
    const years = Array.from(new Set(consumptionList.map(item => item.year.toString())));
    return years.sort((a, b) => Number(b) - Number(a));
  }, [consumptionList]);

  // Filter consumption data by the selected Year
  const filteredByYear = useMemo(() => {
    if (!consumptionList.length) return [];
    if (selectedYear === 'ALL') return consumptionList;
    return consumptionList.filter(item => item.year.toString() === selectedYear);
  }, [consumptionList, selectedYear]);

  // Full months display (no 6M or 12M truncation)
  const chartData = useMemo(() => {
    return filteredByYear;
  }, [filteredByYear]);

  // Keep selectedMonthData synchronized with active chart data
  useEffect(() => {
    if (chartData.length > 0) {
      setSelectedMonthData(prev => {
        if (prev && chartData.some(d => d.month === prev.month && d.year === prev.year)) {
          return prev;
        }
        return chartData[chartData.length - 1];
      });
    } else {
      setSelectedMonthData(null);
    }
  }, [chartData]);

  // Derived metrics
  const currentConsumption = useMemo(() => {
    if (!consumptionList.length) return selectedAccount?.currentBill.kwhConsumed || 385;
    return consumptionList[consumptionList.length - 1].kwh;
  }, [consumptionList, selectedAccount]);

  const prevConsumption = useMemo(() => {
    if (consumptionList.length < 2) return currentConsumption;
    return consumptionList[consumptionList.length - 2].kwh;
  }, [consumptionList, currentConsumption]);

  const consumptionChangePercent = useMemo(() => {
    if (!prevConsumption) return 0;
    return Number((((currentConsumption - prevConsumption) / prevConsumption) * 100).toFixed(1));
  }, [currentConsumption, prevConsumption]);

  const averageUsage = useMemo(() => {
    if (!chartData.length) return 365;
    const sum = chartData.reduce((acc, curr) => acc + curr.kwh, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const dailyAverageUsage = useMemo(() => {
    return (averageUsage / 30).toFixed(1);
  }, [averageUsage]);

  const peakDemand = useMemo(() => {
    if (!chartData.length) return { kw: selectedAccount?.currentBill.peakKw || 4.2, month: 'Current' };
    const highest = chartData.reduce((prev, current) => (prev.peakKw > current.peakKw ? prev : current), chartData[0]);
    return { kw: highest.peakKw, month: highest.month };
  }, [chartData, selectedAccount]);

  const estimatedBill = useMemo(() => {
    if (!consumptionList.length) return selectedAccount?.currentBill.amountDue || 4850.75;
    const latest = consumptionList[consumptionList.length - 1];
    return latest.amount || selectedAccount?.currentBill.amountDue || 4850.75;
  }, [consumptionList, selectedAccount]);

  const effectiveRatePerKwh = useMemo(() => {
    if (!currentConsumption) return 12.6;
    return (estimatedBill / currentConsumption).toFixed(2);
  }, [estimatedBill, currentConsumption]);

  if (!selectedAccount) return null;

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-20 md:pb-12 w-full">
      {/* Top Banner: Service Account Header & Consumption Overview */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF3DF] to-[#FFD08A] flex items-center justify-center text-[#FF5401] shrink-0 shadow-2xs border border-[#FF5401]/20">
            <Zap className="w-6 h-6 fill-[#FF5401]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base md:text-lg font-semibold text-[#2B2B2B]">Electricity Usage Dashboard</h2>
              <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF5401] border border-[#FF5401]/20">
                {selectedAccount.serviceType}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Meter <span className="font-mono font-semibold text-[#2B2B2B]">{selectedAccount.meterNumber}</span> • Account{' '}
              <span className="font-mono font-semibold text-[#2B2B2B]">{selectedAccount.accountNumber}</span>
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#F8FAFC] border border-[#E5E7EB] px-3.5 py-2 rounded-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-600">Smart Meter Telemetry Connected</span>
        </div>
      </div>

      {/* 4 PRIMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* KPI 1: Current Consumption */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Current Consumption</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-[#FF5401] group-hover:scale-105 transition-all">
              <Zap className="w-4 h-4 fill-[#FF5401]" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-semibold text-[#2B2B2B]">{currentConsumption}</span>
              <span className="text-xs font-medium text-slate-500">kWh</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {consumptionChangePercent >= 0 ? (
                <span className="inline-flex items-center text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />+{consumptionChangePercent}% vs last mo.
                </span>
              ) : (
                <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />{consumptionChangePercent}% vs last mo.
                </span>
              )}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">Active billing cycle total</p>
        </div>

        {/* KPI 2: Average Usage */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Average Usage</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-all">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-semibold text-[#2B2B2B]">{averageUsage}</span>
              <span className="text-xs font-medium text-slate-500">kWh / mo</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                ~{dailyAverageUsage} kWh per day
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">
            Full annual billing period ({chartData.length} months)
          </p>
        </div>

        {/* KPI 3: Peak Demand */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Peak Demand</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-105 transition-all">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-semibold text-[#2B2B2B]">{peakDemand.kw}</span>
              <span className="text-xs font-medium text-slate-500">kW</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                Peak recorded in {peakDemand.month}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">Standard residential limit: 10 kW</p>
        </div>

        {/* KPI 4: Estimated Bill */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs hover:border-[#FF5401]/40 transition-all flex flex-col justify-between space-y-3 group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Estimated Bill</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#22C55E] group-hover:scale-105 transition-all">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-semibold text-[#FF5401]">
                ₱{estimatedBill.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Effective rate: ₱{effectiveRatePerKwh}/kWh
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100">Includes all ERC unbundled rates</p>
        </div>
      </div>

      {/* MONTHLY KWH CONSUMPTION CHART WITH FULL MONTHS & CLICKABLE BARS */}
      <div className="bg-white rounded-3xl p-5 md:p-7 border border-[#E5E7EB] shadow-xs space-y-5">
        {/* Chart Header and Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-semibold text-[#2B2B2B]">Monthly kWh Consumption Trend</h3>
              <span className="bg-orange-50 text-[#FF5401] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#FF5401]/20">
                {selectedYear === 'ALL' ? 'All-Time Trend' : `Full ${selectedYear} (${chartData.length} Months)`}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly reference average: <strong className="text-[#FF5401] font-semibold">{averageUsage} kWh</strong>.
              <span className="text-slate-600 font-medium ml-1">Click any bar to view that month's consumption.</span>
            </p>
          </div>

          {/* Controls: Year Filter */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="bg-[#F0F2F5] p-1 rounded-2xl flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-500 pl-2.5 pr-0.5 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#FF5401]" />
                <span>Year:</span>
              </span>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={e => setSelectedYear(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] text-[#2B2B2B] text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl cursor-pointer hover:border-[#FF5401]/50 focus:outline-none focus:border-[#FF5401] shadow-2xs transition-all"
                  aria-label="Filter consumption by year"
                >
                  <option value="ALL">All Years</option>
                  {availableYears.map(yr => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Legend & Active Month Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-[#FF5401]" />
              <span className="text-slate-600 font-medium">Billed Consumption (kWh)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-t-2 border-dashed border-[#E54A00]" />
              <span className="text-slate-600 font-medium">Average Line ({averageUsage} kWh)</span>
            </div>
          </div>

          <div className="text-[11px] font-medium text-slate-500 bg-[#F8FAFC] px-3 py-1 rounded-lg border border-[#E5E7EB]">
            {selectedMonthData ? (
              <span>
                Selected: <strong className="text-[#FF5401]">{selectedMonthData.month} {selectedMonthData.year}</strong> ({selectedMonthData.kwh} kWh • ₱{selectedMonthData.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })})
              </span>
            ) : (
              <span>Click a bar to inspect month</span>
            )}
          </div>
        </div>

        {/* Recharts Bar Chart Container */}
        <div className="h-72 md:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 15, left: -10, bottom: 5 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setSelectedMonthData(state.activePayload[0].payload as ConsumptionData);
                }
              }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredBar(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <defs>
                <linearGradient id="consumptionBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5401" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FF7A33" stopOpacity={0.85} />
                </linearGradient>
                <linearGradient id="peakBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E54A00" stopOpacity={1} />
                  <stop offset="100%" stopColor="#FF5401" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 600 }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                unit=" kWh"
              />
              <Tooltip
                cursor={{ fill: 'rgba(255, 84, 1, 0.08)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ConsumptionData;
                    const diffFromAvg = data.kwh - averageUsage;
                    return (
                      <div className="bg-[#2B2B2B] text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs min-w-[210px] space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-600 pb-1.5">
                          <span className="font-semibold text-white text-sm">
                            {data.month} {data.year}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5401] text-white font-semibold">
                            CEDC Billing
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Energy Consumption:</span>
                            <span className="font-semibold text-[#FF9E66]">{data.kwh} kWh</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Peak Demand:</span>
                            <span className="font-semibold text-slate-100">{data.peakKw} kW</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-300">Billed Amount:</span>
                            <span className="font-semibold text-emerald-400">
                              ₱{data.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-1 border-t border-slate-700 text-[10px]">
                            <span className="text-slate-400">Vs Period Average:</span>
                            <span className={diffFromAvg >= 0 ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                              {diffFromAvg >= 0 ? `+${diffFromAvg} kWh` : `${diffFromAvg} kWh`}
                            </span>
                          </div>
                          <div className="text-[10px] text-center text-[#FF9E66] pt-1 border-t border-slate-700/60 font-medium">
                            👆 Click to view full month details
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={averageUsage}
                stroke="#E54A00"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Average: ${averageUsage} kWh`,
                  fill: '#E54A00',
                  fontSize: 11,
                  fontWeight: 'bold',
                  position: 'top',
                }}
              />
              <Bar
                dataKey="kwh"
                radius={[8, 8, 0, 0]}
                maxBarSize={44}
                className="cursor-pointer"
                onClick={(entry: any) => {
                  if (entry && entry.kwh !== undefined) {
                    setSelectedMonthData(entry as ConsumptionData);
                  }
                }}
              >
                {chartData.map((entry, index) => {
                  const isSelected =
                    selectedMonthData?.month === entry.month &&
                    selectedMonthData?.year === entry.year;
                  const isLatest = index === chartData.length - 1;
                  return (
                    <Cell
                      key={`cell-${entry.year}-${entry.month}-${index}`}
                      cursor="pointer"
                      fill={
                        isSelected
                          ? '#FF5401'
                          : isLatest
                          ? 'url(#peakBarGrad)'
                          : 'url(#consumptionBarGrad)'
                      }
                      stroke={isSelected ? '#2B2B2B' : 'transparent'}
                      strokeWidth={isSelected ? 2 : 0}
                      opacity={selectedMonthData ? (isSelected ? 1 : 0.6) : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CLICKABLE MONTH STRIP FOR QUICK NAVIGATION */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-600">
              Select Month ({chartData.length} Full Months):
            </span>
            <span className="text-[10px] text-slate-400">Click bar or month to view</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5">
            {chartData.map((d, i) => {
              const isSelected = selectedMonthData?.month === d.month && selectedMonthData?.year === d.year;
              return (
                <button
                  key={`month-btn-${d.year}-${d.month}-${i}`}
                  type="button"
                  onClick={() => setSelectedMonthData(d)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FF5401] text-white border-[#FF5401] shadow-xs'
                      : 'bg-[#F8FAFC] text-slate-600 border-[#E2E8F0] hover:bg-slate-100 hover:text-[#2B2B2B]'
                  }`}
                >
                  <span>{d.month}</span>
                  <span className={`text-[10px] ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                    {d.kwh} kWh
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CLICKED MONTH CONSUMPTION DETAIL SPOTLIGHT PANEL */}
        {selectedMonthData && (
          <div className="bg-[#FAF8F5] rounded-2xl p-4 md:p-5 border border-[#EBE5DC] space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EBE5DC] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF5401] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm md:text-base font-semibold text-[#2B2B2B]">
                      {selectedMonthData.month} {selectedMonthData.year} Consumption Details
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5401] border border-[#FF5401]/30">
                      Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Billed usage, demand profile, and unbundled rates for this cycle
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('billing')}
                  className="bg-white hover:bg-slate-50 text-[#FF5401] border border-[#FF5401]/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span>View Statement</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 4 Detail Metrics for Clicked Month */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Total Energy</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl md:text-2xl font-semibold text-[#FF5401]">{selectedMonthData.kwh}</span>
                  <span className="text-xs font-medium text-slate-500">kWh</span>
                </div>
                <div className="mt-1 text-[10px]">
                  {selectedMonthData.kwh >= averageUsage ? (
                    <span className="text-amber-700 font-medium">
                      +{selectedMonthData.kwh - averageUsage} kWh vs period avg
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      -{averageUsage - selectedMonthData.kwh} kWh vs period avg
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Billed Amount</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl md:text-2xl font-semibold text-[#2B2B2B]">
                    ₱{selectedMonthData.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Full month statement</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Peak Demand</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl md:text-2xl font-semibold text-rose-600">{selectedMonthData.peakKw}</span>
                  <span className="text-xs font-medium text-slate-500">kW</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Max 15-min peak</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] shadow-2xs">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block">Effective Rate & Daily</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl md:text-2xl font-semibold text-emerald-600">
                    ₱{(selectedMonthData.amount / selectedMonthData.kwh).toFixed(2)}
                  </span>
                  <span className="text-xs font-medium text-slate-500">/kWh</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  ~{(selectedMonthData.kwh / 30).toFixed(1)} kWh per day
                </span>
              </div>
            </div>

            {/* Estimated Unbundled Cost Breakdown for Selected Month */}
            <div className="bg-white p-3.5 rounded-xl border border-[#E5E7EB] space-y-2">
              <span className="text-[11px] font-semibold text-[#2B2B2B] block">
                Estimated Unbundled Billing Breakdown ({selectedMonthData.month} {selectedMonthData.year}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE5DC]">
                  <span className="text-[10px] text-slate-500 block">Generation (55%)</span>
                  <span className="font-semibold text-[#2B2B2B]">
                    ₱{(selectedMonthData.amount * 0.55).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE5DC]">
                  <span className="text-[10px] text-slate-500 block">Transmission (11%)</span>
                  <span className="font-semibold text-[#2B2B2B]">
                    ₱{(selectedMonthData.amount * 0.11).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE5DC]">
                  <span className="text-[10px] text-slate-500 block">Distribution (17%)</span>
                  <span className="font-semibold text-[#2B2B2B]">
                    ₱{(selectedMonthData.amount * 0.17).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="bg-[#FAF8F5] p-2 rounded-lg border border-[#EBE5DC]">
                  <span className="text-[10px] text-slate-500 block">Taxes & Universal (17%)</span>
                  <span className="font-semibold text-[#2B2B2B]">
                    ₱{(selectedMonthData.amount * 0.17).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer tip */}
        <div className="bg-orange-50/70 border border-[#FF5401]/20 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
          <div className="w-7 h-7 rounded-xl bg-white border border-[#FF5401]/30 flex items-center justify-center shrink-0 text-[#FF5401] mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <p className="text-slate-700 leading-relaxed text-[11px] sm:text-xs">
            <strong className="text-[#FF5401]">Customer Tip:</strong> Your peak monthly consumption recorded was{' '}
            <strong className="text-[#2B2B2B]">{peakDemand.kw} kW</strong> in {peakDemand.month}. Maintaining high-load
            appliances outside 1:00 PM – 4:00 PM peak hours can help reduce grid load and lower your tier distribution
            charges.
          </p>
        </div>
      </div>

    </div>
  );
};
