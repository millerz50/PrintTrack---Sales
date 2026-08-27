import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  Users,
  Bell,
  Send,
  Sparkles,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Shield,
  UserCheck,
  CheckCheck,
  Flame,
  Zap,
  CornerDownRight,
  Info
} from 'lucide-react';
import { ChatMessage, ChatChannel, User } from '../types';
import { CompanyInfo, storage } from '../services/storage';
import { generateAdvisorResponse } from '../services/aiAdvisor';

interface ChatHubProps {
  activeUser: User;
  company: CompanyInfo;
  selectedDate: string;
}

export const ChatHub: React.FC<ChatHubProps> = ({
  activeUser,
  company,
  selectedDate
}) => {
  const [activeChannel, setActiveChannel] = useState<ChatChannel>('ai_advisor');
  const [messages, setMessages] = useState<ChatMessage[]>(() => storage.getChatMessages());
  const [inputText, setInputText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currency = company.currency || '$';

  // Real-time listener for messages
  useEffect(() => {
    const unsub = storage.subscribe(() => {
      setMessages(storage.getChatMessages());
    });
    return () => unsub();
  }, []);

  // Auto-scroll on new messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChannel, isAiThinking]);

  const channelMessages = messages.filter(m => m.channel === activeChannel);

  const unreadTeamCount = messages.filter(m => m.channel === 'team_workshop' && m.isUrgent).length;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    // Send user message
    const userMsg = storage.sendChatMessage({
      channel: activeChannel,
      senderId: activeUser.id,
      senderName: activeUser.name,
      senderRole: activeUser.role,
      senderAvatar: activeUser.avatar || (activeUser.role === 'admin' ? '👑' : '🧑‍💼'),
      text: textToSend,
      isUrgent: isUrgent
    });

    setIsUrgent(false);

    // If channel is AI Advisor, trigger intelligent assistant reply
    if (activeChannel === 'ai_advisor') {
      setIsAiThinking(true);
      setTimeout(() => {
        const aiResponseText = generateAdvisorResponse(textToSend, selectedDate, company);
        storage.sendChatMessage({
          channel: 'ai_advisor',
          senderId: 'ai_copilot',
          senderName: 'PrintTrack AI Advisor',
          senderRole: 'ai',
          senderAvatar: '🤖',
          text: aiResponseText
        });
        setIsAiThinking(false);
      }, 550);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
    setTimeout(() => {
      // Send user prompt directly
      storage.sendChatMessage({
        channel: 'ai_advisor',
        senderId: activeUser.id,
        senderName: activeUser.name,
        senderRole: activeUser.role,
        senderAvatar: activeUser.avatar || '👑',
        text: promptText
      });

      setIsAiThinking(true);
      setTimeout(() => {
        const aiResponseText = generateAdvisorResponse(promptText, selectedDate, company);
        storage.sendChatMessage({
          channel: 'ai_advisor',
          senderId: 'ai_copilot',
          senderName: 'PrintTrack AI Advisor',
          senderRole: 'ai',
          senderAvatar: '🤖',
          text: aiResponseText
        });
        setIsAiThinking(false);
      }, 500);
    }, 50);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row h-[720px] max-h-[82vh]">
      {/* Left Sidebar: Channels & Quick Actions */}
      <div className="w-full md:w-80 bg-slate-900 text-white flex flex-col border-r border-slate-800 flex-shrink-0">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-slate-100">Workshop & AI Chat</h2>
          </div>
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
            Live Hub
          </span>
        </div>

        {/* Channels List */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveChannel('ai_advisor')}
            className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
              activeChannel === 'ai_advisor'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-400/40 flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <p className="font-bold text-xs">AI Printing & Stock Advisor</p>
                <p className="text-[10px] text-slate-300 opacity-80">
                  Real-time analytics, pricing & quotes
                </p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          </button>

          <button
            onClick={() => setActiveChannel('team_workshop')}
            className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between ${
              activeChannel === 'team_workshop'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-400/40 flex items-center justify-center text-lg">
                👥
              </div>
              <div>
                <p className="font-bold text-xs">Production Floor & Staff</p>
                <p className="text-[10px] text-slate-300 opacity-80">
                  Admin & Teller handoffs, job alerts
                </p>
              </div>
            </div>
            {unreadTeamCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadTeamCount}
              </span>
            )}
          </button>

          {/* Quick AI Prompt Shortcuts if in AI Channel */}
          {activeChannel === 'ai_advisor' && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Suggested Prompts
              </p>

              <button
                onClick={() => handleQuickPrompt('Which stock is running out the fastest and what is our daily burn rate?')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-start gap-2 border border-slate-700/60"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Fastest stock depletion report</span>
              </button>

              <button
                onClick={() => handleQuickPrompt("What is our net profit, revenue and expense ratio for today's sales?")}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-start gap-2 border border-slate-700/60"
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Today's financial profit summary</span>
              </button>

              <button
                onClick={() => handleQuickPrompt('Calculate a quote for 100 DTF printed custom t-shirts with estimated profit margin.')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-start gap-2 border border-slate-700/60"
              >
                <DollarSign className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span>Quote: 100 DTF T-Shirts</span>
              </button>

              <button
                onClick={() => handleQuickPrompt('Calculate a quote for 500 A4 full-color promotional flyers.')}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-start gap-2 border border-slate-700/60"
              >
                <FileText className="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>Quote: 500 Promo Flyers</span>
              </button>
            </div>
          )}

          {/* Quick Team Notice Helpers if in Team Channel */}
          {activeChannel === 'team_workshop' && (
            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2">
                Quick Team Broadcasts
              </p>

              <button
                onClick={() => {
                  setInputText('⚠️ Roland printhead cleaning cycle started. Printer offline for 15 mins.');
                  setIsUrgent(false);
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-2 border border-slate-700/60"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Machine Maintenance Status</span>
              </button>

              <button
                onClick={() => {
                  setInputText('📦 Customer pickup ready for Order: Packaging complete at front desk.');
                  setIsUrgent(false);
                }}
                className="w-full text-left p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white text-[11px] transition flex items-center gap-2 border border-slate-700/60"
              >
                <Package className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Order Ready for Pickup</span>
              </button>
            </div>
          )}
        </div>

        {/* Current Active User Status */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-base">{activeUser.avatar || '👤'}</span>
            <div>
              <p className="font-semibold text-slate-200">{activeUser.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{activeUser.role} Account</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
      </div>

      {/* Right Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
        {/* Chat Header */}
        <div className="bg-white px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${
              activeChannel === 'ai_advisor' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {activeChannel === 'ai_advisor' ? '🤖' : '👥'}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                {activeChannel === 'ai_advisor' ? 'PrintTrack AI Business & Inventory Copilot' : 'Production Floor & Workshop Team Chat'}
                {activeChannel === 'ai_advisor' && (
                  <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.2 rounded">
                    Live Data Aware
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {activeChannel === 'ai_advisor'
                  ? 'Ask about live inventory depletion rates, profit margins, cost analysis or custom quotes'
                  : 'Coordinate with print technicians, tellers, and log machine updates'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {channelMessages.map(msg => {
            const isMe = msg.senderId === activeUser.id;
            const isAI = msg.senderRole === 'ai';
            const isSystem = msg.senderRole === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-2 max-w-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                  {msg.senderAvatar || (isAI ? '🤖' : '👤')}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-xl rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : isAI
                      ? 'bg-white border border-indigo-100 text-slate-800 rounded-tl-xs shadow-sm ring-1 ring-indigo-500/10'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Sender Name & Role */}
                  <div className={`flex items-center justify-between gap-3 pb-1 mb-1 border-b ${
                    isMe ? 'border-indigo-500/50 text-indigo-100' : 'border-slate-100 text-slate-400'
                  } text-[10px]`}>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold">{msg.senderName}</span>
                      {msg.senderRole === 'admin' && (
                        <span className={`px-1 rounded text-[9px] font-semibold ${isMe ? 'bg-indigo-700 text-indigo-100' : 'bg-amber-100 text-amber-800'}`}>
                          Admin
                        </span>
                      )}
                      {msg.senderRole === 'ai' && (
                        <span className="bg-indigo-100 text-indigo-800 px-1 rounded text-[9px] font-semibold">
                          AI Copilot
                        </span>
                      )}
                    </div>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  {/* Urgent Flag if set */}
                  {msg.isUrgent && (
                    <div className="inline-flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 shadow-2xs">
                      <Flame className="w-3 h-3 text-white" />
                      <span>URGENT PRIORITY</span>
                    </div>
                  )}

                  {/* Order Reference Tag */}
                  {msg.orderRef && (
                    <div className="inline-block bg-slate-100 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded mb-1.5 border border-slate-200">
                      Ref: {msg.orderRef}
                    </div>
                  )}

                  {/* Stock Alert Card */}
                  {msg.stockAlert && (
                    <div className="bg-amber-50 text-amber-900 border border-amber-200 p-2 rounded-lg my-1 text-[11px]">
                      <span className="font-bold block">⚠️ Low Stock Warning:</span>
                      {msg.stockAlert.itemName} — only <strong>{msg.stockAlert.currentStock} {msg.stockAlert.unit}</strong> remaining in stock.
                    </div>
                  )}

                  {/* Message Content (supports markdown-like formatting) */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Thinking Animation */}
          {isAiThinking && (
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-sm">
                🤖
              </div>
              <div className="bg-white border border-indigo-100 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs text-xs text-indigo-700 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-slate-500 text-[11px] ml-1">Analyzing live print shop metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 space-y-2">
          {activeChannel === 'team_workshop' && (
            <div className="flex items-center space-x-3 px-1 text-xs">
              <label className="flex items-center space-x-1.5 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={e => setIsUrgent(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className={`font-semibold text-[11px] ${isUrgent ? 'text-rose-600' : 'text-slate-500'}`}>
                  Mark as Urgent Priority (Alert Staff)
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                activeChannel === 'ai_advisor'
                  ? 'Ask AI: "Which stock is running low?", "What is our net margin?", "Calculate quote for 100 mugs"...'
                  : 'Type a message to workshop staff...'
              }
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-2xs"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isAiThinking}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
