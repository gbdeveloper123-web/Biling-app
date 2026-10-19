import React, { useState } from 'react';
import {
  LifeBuoy,
  Search,
  MessageSquare,
  Lock,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  X,
  ChevronRight,
} from 'lucide-react';
import { SupportTicket } from '../../../types/superAdmin';

interface CustomerSupportTabProps {
  tickets: SupportTicket[];
  onReplyTicket: (ticketId: string, text: string, isInternalNote: boolean) => void;
  onUpdateStatus: (ticketId: string, status: string, priority?: string) => void;
}

export const CustomerSupportTab: React.FC<CustomerSupportTabProps> = ({
  tickets,
  onReplyTicket,
  onUpdateStatus,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    tickets[0] || null
  );
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredTickets = tickets.filter(
    (t) => filterStatus === 'all' || t.status === filterStatus
  );

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    onReplyTicket(selectedTicket.id, replyText.trim(), isInternalNote);

    // Optimistically append to local state
    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: 'support' as const,
      senderName: isInternalNote ? 'Super Admin (Internal Note)' : 'VYAPRIX Official Support',
      text: replyText.trim(),
      timestamp: new Date().toISOString(),
      isInternalNote,
    };

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
    });

    setReplyText('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-rose-400" />
            <span>Customer Support & Merchant Desk</span>
          </h1>
          <p className="text-xs text-slate-400">
            Resolve merchant inquiries with official replies and secure internal staff notes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterStatus === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({tickets.length})
          </button>
          <button
            onClick={() => setFilterStatus('open')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterStatus === 'open' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilterStatus('resolved')}
            className={`px-3 py-1 rounded-lg font-semibold transition ${
              filterStatus === 'resolved' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* 2-Column Ticket Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Ticket List (Left 4 cols) */}
        <div className="lg:col-span-4 bg-[#16202A] border border-slate-800 rounded-2xl overflow-y-auto p-2 space-y-1.5">
          {filteredTickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1 border ${
                selectedTicket?.id === t.id
                  ? 'bg-blue-600/15 border-blue-500/40'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">#{t.ticketNumber}</span>
                <span className="text-[10px] font-bold uppercase text-amber-400">{t.priority}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 truncate">{t.subject}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{t.businessName}</span>
                <span className="font-mono text-[10px]">
                  {new Date(t.createdDate).toLocaleDateString('en-IN')}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Ticket Details & Chat (Right 8 cols) */}
        {selectedTicket ? (
          <div className="lg:col-span-8 bg-[#16202A] border border-slate-800 rounded-2xl flex flex-col justify-between overflow-hidden">
            {/* Ticket Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#111822]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-white">
                    #{selectedTicket.ticketNumber}: {selectedTicket.subject}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-sky-400">
                    {selectedTicket.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Merchant: <span className="text-white font-semibold">{selectedTicket.businessName}</span> • Contact: {selectedTicket.userName} ({selectedTicket.userPhone})
                </p>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    onUpdateStatus(selectedTicket.id, newStatus);
                    setSelectedTicket({ ...selectedTicket, status: newStatus as any });
                  }}
                  className="py-1 px-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="open">Status: Open</option>
                  <option value="in_progress">Status: In Progress</option>
                  <option value="resolved">Status: Resolved</option>
                  <option value="closed">Status: Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl text-xs max-w-lg ${
                    m.isInternalNote
                      ? 'bg-amber-500/10 border border-amber-500/25 text-amber-200 ml-auto'
                      : m.sender === 'support'
                      ? 'bg-blue-600/20 border border-blue-500/30 text-slate-200 ml-auto'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 mr-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px]">
                    <span className="font-bold flex items-center gap-1">
                      {m.isInternalNote && <Lock className="w-3 h-3 text-amber-400" />}
                      <span>{m.senderName}</span>
                    </span>
                    <span className="text-slate-400 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="leading-relaxed">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-slate-800 bg-[#111822] space-y-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                  />
                  <span className="font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Internal Staff Note (Never shown to customer)
                  </span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    isInternalNote
                      ? 'Write private note for super admins only...'
                      : 'Type response to merchant...'
                  }
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-40 text-white ${
                    isInternalNote
                      ? 'bg-amber-600 hover:bg-amber-500'
                      : 'bg-blue-600 hover:bg-blue-500'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isInternalNote ? 'Log Note' : 'Send Reply'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center text-slate-500 text-xs">
            Select a ticket from the left to inspect conversation.
          </div>
        )}
      </div>
    </div>
  );
};
