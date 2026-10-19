import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { askAiAssistant, BusinessContextSummary } from '../services/aiService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { business, analytics, products, customers, suppliers, expenses, invoices } = useShop();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm_welcome',
      sender: 'assistant',
      text: `Hello! I am your **VYAPRIX AI Business Assistant**. I have analyzed the live records for **${business.name}**.\n\nYou can ask me about your sales, pending customer udhaar, low-stock reorder suggestions, expenses, or profit margins. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Construct context summary
  const getContextSummary = (): BusinessContextSummary => {
    return {
      businessName: business.name,
      totalSalesToday: analytics.salesToday,
      totalSalesThisMonth: analytics.salesThisMonth,
      ordersCountToday: analytics.ordersToday,
      lowStockCount: analytics.lowStockCount,
      lowStockProducts: analytics.lowStockProducts.map((p) => ({
        name: p.name,
        stock: p.stock,
        min: p.minStockLevel,
        sku: p.sku,
      })),
      customerDuesTotal: analytics.pendingPayments,
      customersWithDues: customers
        .filter((c) => c.outstandingBalance > 0)
        .map((c) => ({ name: c.name, phone: c.phone, dues: c.outstandingBalance })),
      supplierDuesTotal: analytics.supplierDues,
      suppliersWithDues: suppliers
        .filter((s) => s.outstandingBalance > 0)
        .map((s) => ({ name: s.businessName, dues: s.outstandingBalance })),
      expensesThisMonth: analytics.expensesThisMonth,
      estimatedProfitThisMonth: analytics.estimatedProfitThisMonth,
      topSellingProducts: analytics.topProducts.map((p) => ({
        name: p.name,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      })),
    };
  };

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: 'm_' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const context = getContextSummary();
    const answer = await askAiAssistant(q, context);

    const botMsg: Message = {
      id: 'm_' + (Date.now() + 1),
      sender: 'assistant',
      text: answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  const promptChips = [
    'How much did I sell today?',
    'Which products are low in stock?',
    'Who owes me money (Khata dues)?',
    'What was my estimated profit this month?',
    'Which product sold the most?',
    'Suggest products I should reorder.',
    'How much did I spend on expenses?',
  ];

  return (
    <div className="w-full max-w-[840px] mx-auto p-3.5 sm:p-6 h-[calc(100vh-5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#DFE6E9] dark:border-[#2A3642] pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#0984E3] text-white flex items-center justify-center shadow-xs relative shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00CEC9] ring-2 ring-white dark:ring-[#1E272E]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#2D3436] dark:text-[#F5F6FA] flex items-center gap-2">
              Goldnifi AI
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#00CEC9]/15 text-[#00CEC9] dark:text-[#00CEC9]">
                Live Store Intelligence
              </span>
            </h2>
            <p className="text-xs text-[#636E72] dark:text-[#B2BEC3]">
              Powered by GOLDEN BAZAAR • Ask anything about your sales, khata, profit, or stock.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-[#1E272E] border border-[#DFE6E9] dark:border-[#2A3642] shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#0984E3] text-white'
                    : 'bg-[#00CEC9]/20 text-[#0984E3] dark:text-[#00CEC9]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[560px] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#0984E3] text-white rounded-tr-xs'
                    : 'bg-[#F5F6FA] dark:bg-[#202B33] text-[#2D3436] dark:text-[#F5F6FA] border border-[#DFE6E9] dark:border-[#2A3642] rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <span
                  className={`text-[10px] mt-1.5 block text-right font-mono ${
                    isUser ? 'text-white/80' : 'text-[#636E72] dark:text-[#B2BEC3]'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00CEC9]/20 text-[#00CEC9] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-[#F5F6FA] dark:bg-[#202B33] rounded-2xl border border-[#DFE6E9] dark:border-[#2A3642] text-xs text-[#636E72] dark:text-[#B2BEC3] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00CEC9] animate-pulse" />
              <span>Analyzing your business transactions and inventory...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
        {promptChips.map((chip) => (
          <button
            key={chip}
            onClick={() => handleSend(chip)}
            className="text-[11px] font-medium px-2.5 py-1.5 bg-white dark:bg-[#202B33] hover:bg-[#F5F6FA] dark:hover:bg-[#2A3642] text-[#2D3436] dark:text-[#F5F6FA] hover:text-[#0984E3] dark:hover:text-[#00CEC9] rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] hover:border-[#00CEC9] transition active:scale-95 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Goldnifi AI about your sales, stock, customers, or expenses..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 h-11 px-3.5 text-xs sm:text-sm rounded-xl border border-[#DFE6E9] dark:border-[#2A3642] bg-white dark:bg-[#182026] text-[#2D3436] dark:text-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#00CEC9]"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="h-11 px-5 text-xs sm:text-sm font-semibold text-white bg-[#0984E3] hover:bg-[#0770C2] rounded-xl shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <span>Ask</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
