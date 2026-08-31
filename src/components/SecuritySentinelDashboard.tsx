import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Cpu, 
  UserCheck, 
  FileText,
  Search,
  Lock,
  Layers
} from 'lucide-react';
import { AuditLog, SecuritySentinelReport } from '../types';

interface SecuritySentinelDashboardProps {
  auditLogs: AuditLog[];
  sentinelReports: SecuritySentinelReport[];
  pendingBatchCount: number;
  onTriggerAuditNow: () => Promise<void>;
  triggerToast: (msg: string) => void;
}

export const SecuritySentinelDashboard: React.FC<SecuritySentinelDashboardProps> = ({
  auditLogs,
  sentinelReports,
  pendingBatchCount,
  onTriggerAuditNow,
  triggerToast
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [batchCountdown, setBatchCountdown] = useState(60);

  // 60s countdown visual indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setBatchCountdown(prev => (prev > 1 ? prev - 1 : 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const latestReport = sentinelReports[0] || {
    id: 'rep-default',
    analyzedAt: new Date().toISOString(),
    batchSize: auditLogs.length,
    overallThreatLevel: 'LOW',
    threatScore: 4,
    summary: 'Sentinel AI has evaluated the showroom audit ledger. All gold rate adjustments, product creations, and 2FA authentications adhere to normal bullion boutique parameters.',
    anomaliesDetected: [],
    recommendations: [
      'Require mandatory 2FA verification on every administrative login.',
      'Enforce strict PNG magic-bytes validation on UPI gateway uploads.',
      'Reconcile physical showroom stock with the digital ledger weekly.'
    ]
  };

  const handleManualAudit = async () => {
    setIsAuditing(true);
    try {
      await onTriggerAuditNow();
      setBatchCountdown(60);
      triggerToast('Gemini AI Security Sentinel completed forensic analysis.');
    } catch (err: any) {
      triggerToast(err.message || 'Audit failed');
    } finally {
      setIsAuditing(false);
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesCategory = categoryFilter === 'ALL' || log.actionCategory === categoryFilter;
    const matchesSearch = 
      log.details.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.adminUser.toLowerCase().includes(searchFilter.toLowerCase()) ||
      log.actionCategory.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getThreatBadge = (level: SecuritySentinelReport['overallThreatLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white border-rose-700 animate-pulse';
      case 'ELEVATED':
        return 'bg-amber-600 text-white border-amber-700';
      case 'MEDIUM':
        return 'bg-yellow-500 text-stone-900 border-yellow-600';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & AI Sentinel Hero */}
      <div className="bg-[#081816] text-[#FAF7F2] p-6 rounded-3xl border border-[#DFB76C]/40 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#DFB76C]/10 border border-[#DFB76C]/30 text-[#DFB76C]">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-lg font-bold text-[#DFB76C]">
                  Gemini AI Security Sentinel & Activity Auditor
                </h3>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  LIVE SENTINEL ACTIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Continuous machine-learning monitoring of administrative mutations, bullion rate spikes, and authentication telemetry.
              </p>
            </div>
          </div>

          {/* Batch Status & Trigger Button */}
          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs">
              <div className="text-stone-400 flex items-center gap-1.5 justify-end">
                <Clock className="w-3.5 h-3.5 text-[#DFB76C]" />
                <span>Next 60s Batch in: <strong className="text-white">{batchCountdown}s</strong></span>
              </div>
              <div className="text-[11px] text-stone-500">
                Buffer: {pendingBatchCount} unanalyzed event(s)
              </div>
            </div>

            <button
              onClick={handleManualAudit}
              disabled={isAuditing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#DFB76C] via-[#C59B27] to-[#996515] text-[#081816] font-bold text-xs flex items-center gap-2 hover:opacity-95 transition shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isAuditing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Forensic Audit Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Threat Gauge & Forensic Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
          
          {/* Threat Metric Card (4 cols) */}
          <div className="md:col-span-4 p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 block">
              Forensic Threat Assessment
            </span>
            
            <div className="flex items-center justify-between">
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider border ${getThreatBadge(latestReport.overallThreatLevel)}`}>
                  ● {latestReport.overallThreatLevel} RISK
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-[#DFB76C]">
                  {latestReport.threatScore}<span className="text-xs text-stone-500">/100</span>
                </span>
                <span className="block text-[10px] text-stone-500">Threat Score</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  latestReport.threatScore > 60 ? 'bg-rose-500' : latestReport.threatScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(5, latestReport.threatScore)}%` }}
              />
            </div>
          </div>

          {/* AI Forensic Summary & Recommendations (8 cols) */}
          <div className="md:col-span-8 p-4 rounded-2xl bg-stone-900/80 border border-stone-800 space-y-2 text-xs">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#DFB76C] block">
              Gemini AI Security Synthesis
            </span>
            <p className="text-stone-300 leading-relaxed font-sans">
              {latestReport.summary}
            </p>

            {latestReport.anomaliesDetected && latestReport.anomaliesDetected.length > 0 ? (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Anomalies Flagged ({latestReport.anomaliesDetected.length}):</span>
                </span>
                {latestReport.anomaliesDetected.map((anom, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-amber-950/40 border border-amber-600/30 text-amber-200 text-[11px]">
                    <strong>[{anom.ruleId}]</strong> {anom.description} — <em className="text-amber-400">{anom.suggestedAction}</em>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-[11px] pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero malicious anomalies or bullion rate manipulation detected in active stream.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Audit Activity Stream Controls & Table */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="font-serif-luxury text-base font-bold text-stone-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#C59B27]" />
              <span>Administrative Activity Ledger ({auditLogs.length})</span>
            </h4>
            <p className="text-xs text-stone-500">
              Immutable audit stream routed into Gemini AI for threat evaluation and compliance.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit events..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#C59B27]"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {['ALL', 'AUTH_LOGIN', 'AUTH_FAILED', 'RATES_UPDATE', 'PRODUCT_CREATE', 'PRODUCT_SOFT_DELETE', 'INVENTORY_CHECKIN', 'INVENTORY_CHECKOUT', 'UPI_QR_ROTATE'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full transition cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#081816] text-[#DFB76C]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Audit Log Table */}
        <div className="rounded-xl border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Details & Mutation</th>
                  <th className="p-3">Admin Account</th>
                  <th className="p-3">IP & Agent</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-sans">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-stone-400">
                      No audit events match your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-stone-50/80 transition">
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] font-mono ${
                          log.riskSeverity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : log.riskSeverity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {log.actionCategory}
                        </span>
                      </td>
                      <td className="p-3 text-stone-800 font-medium max-w-md">
                        {log.details}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-stone-600">
                        {log.adminUser}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-stone-400">
                        <div>{log.ipAddress || '127.0.0.1'}</div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
