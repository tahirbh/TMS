import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Zap,
  TrendingUp,
  Clock,
  CalendarDays,
  BarChart3,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CircleDot,
  RefreshCw,
} from 'lucide-react';
import { getTokenUsageSummary, clearTokenUsage, type TokenUsageSummary, type TokenUsageEntry } from '@/api/base44Client';

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function HistoryRow({ entry }: { entry: TokenUsageEntry }) {
  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const docLabel = entry.docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="flex items-center gap-3 py-2 px-1 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs">
      <div className={`w-2 h-2 rounded-full shrink-0 ${entry.success ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{docLabel}</p>
        <p className="text-[10px] text-slate-400">{dateStr} · {timeStr}</p>
      </div>
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
        entry.source === 'api'
          ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
      }`}>
        {entry.source === 'api' ? 'API' : 'Local'}
      </span>
      <span className="font-mono font-bold text-slate-600 dark:text-slate-300 tabular-nums w-14 text-right">
        {formatNumber(entry.totalTokens)}
      </span>
    </div>
  );
}

export default function TokenUsageCard() {
  const [summary, setSummary] = useState<TokenUsageSummary | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setSummary(getTokenUsageSummary());
  }, [refreshKey]);

  const handleClear = () => {
    if (window.confirm('Clear all LLM token usage history? This cannot be undone.')) {
      clearTokenUsage();
      setRefreshKey(k => k + 1);
    }
  };

  const handleRefresh = () => setRefreshKey(k => k + 1);

  const recentHistory = useMemo(
    () => (summary?.history || []).slice().reverse().slice(0, 20),
    [summary]
  );

  // Build last-7-days sparkline data
  const dailyData = useMemo(() => {
    if (!summary) return [];
    const days: { label: string; tokens: number; calls: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
      const dayEntries = summary.history.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
      days.push({
        label: d.toLocaleDateString([], { weekday: 'short' }),
        tokens: dayEntries.reduce((s, e) => s + e.totalTokens, 0),
        calls: dayEntries.length,
      });
    }
    return days;
  }, [summary]);

  const maxDailyTokens = Math.max(...dailyData.map(d => d.tokens), 1);

  if (!summary) return null;

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-violet-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30">
      {/* Decorative background */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-violet-400/10 to-indigo-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-gradient-to-tr from-blue-400/10 to-cyan-400/10 blur-3xl pointer-events-none" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-800 dark:text-white">LLM Token Monitor</h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">AI Usage Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600" onClick={handleRefresh}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-rose-500" onClick={handleClear}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Total Tokens */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
              {formatNumber(summary.totalTokens)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{summary.totalCalls} calls</p>
          </div>

          {/* Today */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Today</span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
              {formatNumber(summary.todayTokens)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{summary.todayCalls} calls</p>
          </div>

          {/* This Month */}
          <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Month</span>
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white tabular-nums leading-none">
              {formatNumber(summary.thisMonthTokens)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">{summary.thisMonthCalls} calls</p>
          </div>
        </div>

        {/* Breakdown bars */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Token Breakdown</span>
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              avg {formatNumber(summary.avgTokensPerCall)} / call
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <ArrowUpRight className="w-3 h-3 text-violet-500" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Prompt (Input)</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                  {formatNumber(summary.totalPromptTokens)}
                </span>
              </div>
              <MiniBar value={summary.totalPromptTokens} max={summary.totalTokens} color="bg-gradient-to-r from-violet-500 to-indigo-500" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <ArrowDownRight className="w-3 h-3 text-blue-500" />
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Completion (Output)</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-500 tabular-nums">
                  {formatNumber(summary.totalCompletionTokens)}
                </span>
              </div>
              <MiniBar value={summary.totalCompletionTokens} max={summary.totalTokens} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
            </div>
          </div>
        </div>

        {/* 7-Day Mini Chart */}
        <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-sm mb-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-300">Last 7 Days</span>
          </div>
          <div className="flex items-end gap-1.5 h-16">
            {dailyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-md bg-gradient-to-t from-violet-500 to-indigo-400 min-h-[2px]"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((day.tokens / maxDailyTokens) * 48, 2)}px` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                  title={`${day.tokens.toLocaleString()} tokens · ${day.calls} calls`}
                />
                <span className="text-[9px] font-bold text-slate-400">{day.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Source indicator */}
        <div className="flex items-center gap-4 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-[10px] font-bold text-slate-400">API Calls</span>
            <span className="text-[10px] font-mono text-slate-500">
              {summary.history.filter(e => e.source === 'api').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-slate-400">Local Fallback</span>
            <span className="text-[10px] font-mono text-slate-500">
              {summary.history.filter(e => e.source === 'local_fallback').length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-bold text-slate-400">Failed</span>
            <span className="text-[10px] font-mono text-slate-500">
              {summary.history.filter(e => !e.success).length}
            </span>
          </div>
        </div>

        {/* Toggle History */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs font-bold text-slate-500 hover:text-violet-600 gap-2"
          onClick={() => setShowHistory(!showHistory)}
        >
          <Sparkles className="w-3.5 h-3.5" />
          {showHistory ? 'Hide' : 'Show'} Call History ({summary.totalCalls})
          <CircleDot className="w-3 h-3 text-emerald-500 animate-pulse" />
        </Button>

        {/* History List */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-3 max-h-64 overflow-y-auto rounded-xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-2">
                {recentHistory.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No LLM calls recorded yet</p>
                ) : (
                  recentHistory.map(entry => (
                    <HistoryRow key={entry.id} entry={entry} />
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer note */}
        <p className="text-center text-[9px] text-slate-400 mt-3 font-medium">
          Token counts are estimates based on character length · {summary.totalCalls > 0 ? 'Data persisted locally' : 'No data yet'}
        </p>
      </div>
    </Card>
  );
}
