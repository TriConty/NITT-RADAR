/**
 * src/components/EmailLogDrawer.tsx
 *
 * "Email sent" simulator for NIT Trichy Webmail.
 * Displays all automated campus alert emails sent to @nitt.edu addresses.
 */

import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Clock, Calendar, Sparkles, Inbox } from 'lucide-react';
import { SimulatedEmailLog } from '../types';

interface EmailLogDrawerProps {
  isOpen: boolean;
  logs: SimulatedEmailLog[];
  onClose: () => void;
  onClearLogs?: () => void;
}

export const EmailLogDrawer: React.FC<EmailLogDrawerProps> = ({
  isOpen,
  logs,
  onClose,
}) => {
  const [selectedLog, setSelectedLog] = useState<SimulatedEmailLog | null>(logs[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base">NITT Webmail Simulator</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Automated 48h/24h deadline & confirmation emails
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Two-column simulated Webmail interface */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Email List Column */}
          <div className="w-full md:w-5/12 border-r border-slate-200 overflow-y-auto bg-slate-50 divide-y divide-slate-200">
            {logs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">No emails sent yet</p>
              </div>
            ) : (
              logs.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedLog(item)}
                  className={`w-full text-left p-3.5 transition-colors block ${
                    selectedLog?.id === item.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium truncate max-w-[120px]">{item.recipientEmail}</span>
                    <span className="shrink-0">{new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs line-clamp-1 mb-1">
                    {item.subject}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.snippet}
                  </p>
                </button>
              ))
            )}
          </div>

          {/* Email Preview Column */}
          <div className="flex-1 overflow-y-auto p-5 bg-white">
            {selectedLog ? (
              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <h3 className="text-base font-extrabold text-slate-900 leading-snug mb-3">
                    {selectedLog.subject}
                  </h3>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">From:</span>
                      <span className="font-mono text-slate-800">events-noreply@nitt.edu</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">To:</span>
                      <span className="font-mono text-blue-700">{selectedLog.recipientEmail}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-500">Timestamp:</span>
                      <span className="text-slate-600">{new Date(selectedLog.sentAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Rendered HTML-style Email Body */}
                <div className="rounded-xl border border-slate-200 p-5 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-[#0F2B5C] flex items-center justify-center text-[10px] text-white font-bold">
                        NIT
                      </div>
                      <span className="font-bold text-xs text-slate-800">NIT Trichy Campus Event Hub</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Official Dispatch
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    Dear {selectedLog.recipientName || 'NIT Trichy Student'},
                  </p>

                  <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-slate-800 leading-relaxed">
                    {selectedLog.snippet}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    This notification was automatically dispatched based on your campus reminder preferences and saved deadlines.
                    Remember: you can adjust your reminder triggers anytime in your student settings.
                  </p>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Office of Dean (Students Welfare), SAC Building</span>
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>DKIM Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                Select an email from the left pane to view formatted contents.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
