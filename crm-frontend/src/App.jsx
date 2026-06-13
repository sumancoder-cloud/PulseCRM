import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useRealtime } from "./useRealtime";
import CampaignCustomizer from "./CampaignCustomizer";
import {
  Activity, MessageSquare, BarChart3, Users, Send, Sparkles,
  RefreshCw, Coffee, Heart, AlertTriangle, Moon, Star, Zap,
  ArrowRight, Radio, TrendingUp, IndianRupee, Wifi, WifiOff,
  Database, PlusCircle, Smartphone, Mail, Check, CheckCheck, X
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const VITAL_ICONS = {
  Champions: Star,
  Loyal: Heart,
  "At Risk": AlertTriangle,
  Hibernating: Moon,
  New: Sparkles,
};

const CHANNEL_COLORS = {
  WHATSAPP: "#25D366",
  SMS: "#3b82f6",
  EMAIL: "#8b5cf6",
  RCS: "#e85d4c",
};

const SUGGESTIONS = [
  "Win back at-risk shoppers who haven't ordered in 60 days with a 15% discount",
  "Reward our champion coffee lovers with an exclusive early-access blend",
  "Re-engage hibernating shoppers with a free shipping offer on WhatsApp",
  "Welcome new shoppers who never made a second purchase",
];

function StatCard({ label, value, sub, color = "coffee" }) {
  const colors = {
    coffee: "bg-coffee-50 text-coffee-700 border-coffee-200",
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    red: "bg-red-50 text-red-700 border-red-200",
    pulse: "bg-orange-50 text-pulse border-orange-200",
  };
  return (
    <div className={`p-4 rounded-2xl border stat-glow ${colors[color]}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
}

function MessageMockup({ channel, message }) {
  const displayMsg = message.replace(/\{name\}/gi, "Aarav");
  
  if (channel === 'WHATSAPP') {
    return (
      <div className="mx-auto max-w-[280px] bg-slate-950 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-850 relative select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-950 rounded-b-xl z-10 flex items-center justify-center">
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>
        
        <div className="bg-[#efeae2] rounded-[2rem] overflow-hidden border border-slate-900 flex flex-col h-[380px] font-sans relative">
          <div className="bg-[#075e54] text-white px-3 pt-5 pb-2 flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-coffee-800 text-[10px]">
              AR
            </div>
            <div>
              <p className="text-[10px] font-bold leading-tight">Arora Roast ☕</p>
              <p className="text-[8px] opacity-80 leading-none">Business Account</p>
            </div>
          </div>
          
          <div className="flex-1 p-2 overflow-y-auto space-y-1.5 bg-cover bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
            <div className="mx-auto bg-amber-50/90 text-[8px] text-amber-900 px-2 py-0.5 rounded border border-amber-200/50 text-center max-w-[170px] shadow-sm leading-tight">
              🔒 Messages are secured with end-to-end encryption.
            </div>
            
            <div className="bg-[#dcf8c6] rounded-lg p-2 text-[10px] text-slate-800 max-w-[200px] shadow-sm ml-auto rounded-tr-none relative border border-slate-200/30">
              <p className="leading-snug whitespace-pre-wrap">{displayMsg}</p>
              <div className="flex justify-end items-center gap-0.5 mt-0.5 text-[7px] text-slate-400">
                <span>10:42 AM</span>
                <CheckCheck className="w-2.5 h-2.5 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-[#f0f0f0] p-1.5 flex items-center gap-1.5 border-t shrink-0">
            <div className="flex-1 bg-white rounded-full px-2 py-1 text-[8px] text-slate-400 border shadow-inner">
              Type a message...
            </div>
            <div className="w-5 h-5 rounded-full bg-[#075e54] flex items-center justify-center text-white">
              <Send className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (channel === 'SMS' || channel === 'RCS') {
    return (
      <div className="mx-auto max-w-[280px] bg-slate-950 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-855 relative select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-950 rounded-b-xl z-10 flex items-center justify-center">
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>
        
        <div className="bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-900 flex flex-col h-[380px] font-sans relative">
          <div className="bg-white text-slate-800 px-3 pt-5 pb-2 flex items-center gap-1.5 border-b shadow-sm justify-between shrink-0">
            <span className="text-[10px] font-bold text-slate-400">←</span>
            <div className="text-center">
              <p className="text-[10px] font-bold leading-tight">Arora Roast</p>
              <p className="text-[7px] text-slate-400">SMS · India</p>
            </div>
            <span className="text-[10px] text-transparent">→</span>
          </div>
          
          <div className="flex-1 p-2 overflow-y-auto space-y-1.5 flex flex-col justify-end">
            <div className="bg-blue-600 text-white rounded-2xl px-2.5 py-1.5 text-[10px] max-w-[190px] shadow-sm ml-auto rounded-br-none relative">
              <p className="leading-snug whitespace-pre-wrap">{displayMsg}</p>
              <span className="block text-[6px] text-blue-200 mt-0.5 text-right">Sent · Just now</span>
            </div>
            {channel === 'RCS' && (
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm max-w-[170px] ml-auto mt-1 border-slate-200">
                <div className="bg-coffee-500 h-10 flex items-center justify-center text-[9px] text-white font-bold">
                  ☕ Hot Brew Deal
                </div>
                <div className="p-1.5 text-[8px]">
                  <p className="font-semibold text-slate-800">Exclusive Blend</p>
                  <p className="text-slate-500 text-[7px] mt-0.5">Limited Stock Coffee</p>
                  <button className="w-full mt-1.5 py-1 bg-coffee-800 text-white rounded text-[7px] font-bold cursor-pointer hover:bg-coffee-700">
                    Order Now
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-2 flex items-center gap-1 border-t shrink-0">
            <div className="flex-1 bg-slate-50 rounded-full px-2 py-1 text-[8px] text-slate-400 border border-slate-200 shadow-inner">
              Text message (RCS)...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[340px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden font-sans text-[10px] select-none text-left">
      <div className="bg-slate-100 px-3 py-1.5 border-b flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-yellow-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="text-[8px] text-slate-400 ml-2 font-semibold">Arora Roast Brew Mailer</span>
      </div>
      
      <div className="p-3 border-b space-y-1 bg-slate-50/50">
        <div>
          <span className="text-slate-400 font-semibold pr-1.5">From:</span>
          <span className="text-slate-700 font-medium">Arora Roast &lt;brew@aroraroast.in&gt;</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold pr-1.5">To:</span>
          <span className="text-slate-650">aarav.sharma@example.com</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold pr-1.5">Subject:</span>
          <span className="text-slate-800 font-bold">Your premium roast is waiting ☕</span>
        </div>
      </div>
      
      <div className="p-4 min-h-[140px] bg-white leading-relaxed text-slate-700">
        <div className="text-center mb-3">
          <span className="inline-block px-2.5 py-0.5 bg-coffee-50 border border-coffee-200 text-coffee-800 rounded-full font-bold text-[8px] tracking-wide uppercase">
            Arora Roast Coffee Co.
          </span>
        </div>
        <p className="whitespace-pre-wrap leading-snug">{displayMsg}</p>
        <hr className="my-3 border-slate-100" />
        <div className="text-center text-[7px] text-slate-400 leading-normal">
          You are receiving this email because you subscribed to Arora Roast.
          <br />
          Mumbai · Bangalore · Pune
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("copilot");
  const [campaigns, setCampaigns] = useState([]);
  const [vitals, setVitals] = useState(null);
  const [chatGoal, setChatGoal] = useState("");
  const [aiSegment, setAiSegment] = useState(null);
  const [aiCampaign, setAiCampaign] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const selectedIdRef = useRef(null);

  const [shoppersList, setShoppersList] = useState([]);
  const [newShopper, setNewShopper] = useState({ name: "", email: "", phone: "", city: "" });
  const [newOrder, setNewOrder] = useState({ customerId: "", amount: "", product: "" });
  const [notification, setNotification] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/dashboard`);
      setCampaigns(data.campaigns);
      setVitals(data.vitals);

      const customersRes = await axios.get(`${API_BASE}/customers`);
      setShoppersList(customersRes.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const refreshCampaignDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      const { data } = await axios.get(`${API_BASE}/campaigns/${id}`);
      setSelectedCampaign(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const onCampaignStats = useCallback((data) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === data.campaignId ? { ...c, stats: data.stats } : c
      )
    );
    if (selectedIdRef.current === data.campaignId) {
      refreshCampaignDetail(data.campaignId);
    }
  }, [refreshCampaignDetail]);

  const onCommunicationUpdate = useCallback((data) => {
    if (selectedIdRef.current === data.campaignId) {
      refreshCampaignDetail(data.campaignId);
    }
  }, [refreshCampaignDetail]);

  const { connected, activities } = useRealtime({
    onCampaignStats,
    onCommunicationUpdate,
    onCampaignLaunch: () => fetchDashboard(),
    onCampaignCompleted: () => fetchDashboard(),
  });

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    selectedIdRef.current = selectedCampaign?.id || null;
  }, [selectedCampaign]);

  const handleAnalyze = async (goal = chatGoal) => {
    if (!goal) return;
    setLoading(true);
    setChatGoal(goal);
    try {
      console.log('[Diagnose] Starting analysis for goal:', goal);
      const { data } = await axios.post(`${API_BASE}/ai/segment`, { prompt: goal });
      console.log('[Diagnose] Analysis complete:', data);
      setAiSegment(data);
      setAiCampaign(null);
      showToast(`✓ Found ${data.audienceSize} shoppers matching your goal!`);
    } catch (error) {
      console.error('[Diagnose Error]:', error.message);
      showToast("Failed to analyze — is the backend running?", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const segRes = await axios.post(`${API_BASE}/segments`, {
        name: `Pulse: ${chatGoal.slice(0, 30)}`,
        rule: aiSegment.rule,
        description: aiSegment.aiReasoning,
        vitalsLabel: aiSegment.rule?.vitalsLabel,
      });
      
      // Use new /api/ai/message endpoint for dynamic generation
      const campRes = await axios.post(`${API_BASE}/ai/message`, {
        segmentId: segRes.data._id,
        goal: chatGoal,
      });
      
      setAiCampaign({ 
        ...campRes.data, 
        segmentId: segRes.data._id,
        audienceSize: aiSegment.audienceSize 
      });
      showToast("✨ Message, channel, and discount customized!");
    } catch (error) {
      console.error("Campaign generation failed:", error);
      showToast("Campaign generation failed — see browser console", "error");
    }
    setLoading(false);
  };

  const handleLaunch = async (customizations = {}) => {
    if (!aiCampaign || !aiCampaign.segmentId) {
      showToast("Campaign data is missing", "error");
      return;
    }

    setLoading(true);
    try {
      const launchPayload = {
        name: `Pulse Campaign — ${new Date().toLocaleDateString()}`,
        goal: chatGoal,
        segmentId: aiCampaign.segmentId,
        message: customizations.message || aiCampaign.message,
        channel: customizations.channel || aiCampaign.channel,
        discount: customizations.discount !== undefined ? customizations.discount : aiCampaign.discount,
        selectedUserIds: customizations.selectedUserIds,
      };

      console.log('[Launch] Draft payload:', launchPayload);
      // Create draft campaign first
      const draftRes = await axios.post(`${API_BASE}/campaigns/customize`, launchPayload);
      console.log('[Launch] Draft campaign created:', draftRes.data.campaignId);
      
      // Launch the campaign
      const launchRes = await axios.post(`${API_BASE}/campaigns/launch`, {
        name: launchPayload.name,
        goal: launchPayload.goal,
        segmentId: launchPayload.segmentId,
        message: launchPayload.message,
        channel: launchPayload.channel,
        discount: launchPayload.discount,
        selectedUserIds: launchPayload.selectedUserIds,
      });
      console.log('[Launch] Campaign launched successfully:', launchRes.data);

      setChatGoal("");
      setAiSegment(null);
      setAiCampaign(null);
      setTab("dashboard");
      fetchDashboard();
      showToast("🚀 Campaign launched successfully!");
    } catch (error) {
      console.error("[Launch Error]", error);
      console.error("Error details:", error.response?.data);
      showToast(error.response?.data?.error || "Launch failed — see console for details", "error");
    }
    setLoading(false);
  };

  const openCampaign = async (id) => {
    try {
      const { data } = await axios.get(`${API_BASE}/campaigns/${id}`);
      setSelectedCampaign(data);
    } catch {
      showToast("Could not load campaign", "error");
    }
  };

  const handleAddShopper = async (e) => {
    e.preventDefault();
    if (!newShopper.name || !newShopper.email) {
      showToast("Name and email are required", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/customers`, newShopper);
      showToast(`Shopper "${data.name}" added successfully!`);
      setNewShopper({ name: "", email: "", phone: "", city: "" });
      fetchDashboard();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to add shopper";
      showToast(errMsg, "error");
    }
    setLoading(false);
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!newOrder.customerId || !newOrder.amount) {
      showToast("Please select a shopper and enter an amount", "error");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE}/orders`, newOrder);
      showToast(`Order of ₹${data.order.amount} recorded for ${data.customer.name}!`);
      setNewOrder({ customerId: "", amount: "", product: "" });
      fetchDashboard();
    } catch (err) {
      const errMsg = err.response?.data?.error || "Failed to add order";
      showToast(errMsg, "error");
    }
    setLoading(false);
  };

  const totalAttributed = campaigns.reduce((s, c) => s + (c.stats?.attributedRevenue || 0), 0);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-72 gradient-hero text-white flex flex-col p-6 shrink-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-pulse flex items-center justify-center animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PulseCRM</h1>
            <p className="text-coffee-200 text-xs">AI Shopper Vitals Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 mb-8 px-3 py-2 rounded-xl bg-white/10 text-sm">
          <Coffee className="w-4 h-4 text-coffee-200" />
          <span className="text-coffee-100">Arora Roast</span>
          <span className="ml-auto text-xs bg-pulse/80 px-2 py-0.5 rounded-full">D2C Demo</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {[
            { id: "copilot", icon: MessageSquare, label: "AI Copilot" },
            { id: "vitals", icon: Heart, label: "Shopper Vitals" },
            { id: "addData", icon: Database, label: "Add Data" },
            { id: "dashboard", icon: BarChart3, label: "Live Campaigns" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setSelectedCampaign(null); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                tab === id ? "bg-white/20 font-semibold shadow-lg" : "hover:bg-white/10 text-coffee-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {connected ? (
              <Wifi className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-red-400" />
            )}
            <span className="text-xs font-semibold text-coffee-100">
              {connected ? "Live Stream" : "Reconnecting…"}
            </span>
            <Radio className={`w-3 h-3 ml-auto ${connected ? "text-green-400 animate-pulse" : "text-gray-400"}`} />
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-48">
            {activities.length === 0 ? (
              <p className="text-[10px] text-coffee-300 italic">Events appear here in real-time…</p>
            ) : (
              activities.slice(0, 12).map((a, i) => (
                <div key={i} className="text-[10px] bg-white/5 rounded-lg px-2 py-1.5 border border-white/5">
                  <span className="text-coffee-300">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : ""}</span>
                  <p className="text-coffee-100 mt-0.5 leading-tight">{a.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-[10px] text-coffee-300">WebSocket · Xeno Take-Home 2026</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-coffee-50">
        {tab === "copilot" && (
          <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8 animate-fade-up">
              <h2 className="text-3xl font-bold text-coffee-900">Campaign Copilot</h2>
              <p className="text-coffee-500 mt-1">
                Describe your goal — AI diagnoses shopper vitals, drafts messages, and picks the channel.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAnalyze(s)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white border border-coffee-200 text-coffee-600 hover:bg-coffee-100 hover:border-coffee-300 transition-colors"
                >
                  {s.slice(0, 50)}…
                </button>
              ))}
            </div>

            <div className="glass-card rounded-2xl p-6 mb-6 shadow-sm animate-fade-up">
              <label className="text-sm font-semibold text-coffee-700 mb-3 block">
                What's your campaign goal?
              </label>
              <div className="flex gap-3">
                <input
                  value={chatGoal}
                  onChange={(e) => setChatGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="e.g. Win back at-risk shoppers inactive 60+ days with 15% off on WhatsApp"
                  className="flex-1 px-4 py-3 rounded-xl border border-coffee-200 focus:ring-2 focus:ring-pulse/30 focus:border-pulse outline-none bg-white"
                />
                <button
                  onClick={() => handleAnalyze()}
                  disabled={loading || !chatGoal}
                  className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shrink-0 transition-all duration-200 ${
                    loading
                      ? 'bg-coffee-600 text-white cursor-wait opacity-100'
                      : chatGoal
                      ? 'bg-coffee-800 text-white hover:bg-coffee-700 hover:shadow-lg cursor-pointer'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                  }`}
                  title={loading ? 'Analyzing your goal...' : chatGoal ? 'Click to analyze' : 'Enter a campaign goal first'}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Diagnose</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {aiSegment && (
              <div className="glass-card rounded-2xl p-6 mb-6 shadow-sm border-l-4 border-l-purple-500 animate-fade-up">
                <div className="flex items-center gap-2 text-purple-700 font-semibold mb-4">
                  <Users className="w-5 h-5" />
                  AI Diagnosis — Audience Found
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                  <StatCard label="Audience Size" value={aiSegment.audienceSize} sub="shoppers matched" color="purple" />
                  <StatCard
                    label="Vitals Segment"
                    value={aiSegment.rule?.vitalsLabel || "Custom"}
                    sub={aiSegment.aiReasoning}
                    color="coffee"
                  />
                  <StatCard
                    label="Spend Threshold"
                    value={aiSegment.rule?.spend ? `₹${aiSegment.rule.spend}+` : "—"}
                    sub={aiSegment.rule?.daysInactive ? `${aiSegment.rule.daysInactive}d inactive` : ""}
                    color="blue"
                  />
                </div>

                {aiSegment.audience?.length > 0 && (
                  <div className="overflow-x-auto mb-5">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-coffee-500 border-b border-coffee-100">
                          <th className="pb-2 pr-4">Shopper</th>
                          <th className="pb-2 pr-4">Vitals</th>
                          <th className="pb-2 pr-4">Spent</th>
                          <th className="pb-2">Inactive</th>
                        </tr>
                      </thead>
                      <tbody>
                        {aiSegment.audience.map((s) => (
                          <tr key={s.id} className="border-b border-coffee-50">
                            <td className="py-2 pr-4 font-medium">{s.name}</td>
                            <td className="py-2 pr-4">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-coffee-100 text-coffee-700">
                                {s.vitalsLabel}
                              </span>
                            </td>
                            <td className="py-2 pr-4">₹{s.totalSpent?.toLocaleString()}</td>
                            <td className="py-2">{s.recencyDays != null ? `${s.recencyDays}d` : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!aiCampaign && (
                  <button
                    onClick={handleGenerate}
                    disabled={loading || aiSegment.audienceSize === 0}
                    className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" /> Generate Message & Channel Strategy
                  </button>
                )}
              </div>
            )}

            {aiCampaign && (
              <CampaignCustomizer
                aiCampaign={aiCampaign}
                aiSegment={aiSegment}
                chatGoal={chatGoal}
                onLaunch={handleLaunch}
                loading={loading}
              />
            )}
          </div>
        )}

        {tab === "vitals" && vitals && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-coffee-900">Shopper Vitals</h2>
              <p className="text-coffee-500 mt-1">
                RFM-powered health map — {vitals.totalShoppers} shoppers across 5 vitals segments
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="glass-card rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-coffee-800 mb-4">Vitals Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={vitals.groups.filter((g) => g.count > 0)}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                      >
                        {vitals.groups.map((g) => (
                          <Cell key={g.label} fill={g.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 mt-2 justify-center">
                  {vitals.groups.map((g) => {
                    const Icon = VITAL_ICONS[g.label] || Users;
                    return (
                      <div key={g.label} className="flex items-center gap-1.5 text-xs text-coffee-600">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                        <Icon className="w-3 h-3" />
                        {g.label} ({g.count})
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {vitals.groups.map((g) => {
                  const Icon = VITAL_ICONS[g.label] || Users;
                  return (
                    <div key={g.label} className="glass-card rounded-2xl p-5 shadow-sm stat-glow" style={{ borderLeft: `4px solid ${g.color}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4" style={{ color: g.color }} />
                        <span className="text-sm font-semibold text-coffee-700">{g.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-coffee-900">{g.count}</p>
                      <p className="text-xs text-coffee-400 mt-1">
                        {((g.count / vitals.totalShoppers) * 100).toFixed(0)}% of base
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-sm overflow-x-auto">
              <h3 className="font-semibold text-coffee-800 mb-4">Shopper RFM Scores</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-coffee-500 border-b border-coffee-100">
                    <th className="pb-3 pr-4">Name</th>
                    <th className="pb-3 pr-4">City</th>
                    <th className="pb-3 pr-4">Vitals</th>
                    <th className="pb-3 pr-4">R</th>
                    <th className="pb-3 pr-4">F</th>
                    <th className="pb-3 pr-4">M</th>
                    <th className="pb-3 pr-4">Spent</th>
                    <th className="pb-3">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {vitals.shoppers.slice(0, 25).map((s) => (
                    <tr key={s.id} className="border-b border-coffee-50 hover:bg-coffee-50/50">
                      <td className="py-2.5 pr-4 font-medium">{s.name}</td>
                      <td className="py-2.5 pr-4 text-coffee-500">{s.city}</td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${s.vitalsColor}22`, color: s.vitalsColor }}>
                          {s.vitalsLabel}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">{s.rScore}</td>
                      <td className="py-2.5 pr-4">{s.fScore}</td>
                      <td className="py-2.5 pr-4">{s.mScore}</td>
                      <td className="py-2.5 pr-4">₹{s.totalSpent.toLocaleString()}</td>
                      <td className="py-2.5">{s.orderCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "dashboard" && !selectedCampaign && (
          <div className="max-w-6xl mx-auto p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-coffee-900">Live Campaign Analytics</h2>
                <p className="text-coffee-500 mt-1 flex items-center gap-2">
                  {connected ? (
                    <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Live via WebSocket</>
                  ) : (
                    <><span className="w-2 h-2 rounded-full bg-red-400" /> Connecting…</>
                  )}
                </p>
              </div>
              <button onClick={fetchDashboard} className="p-2 rounded-lg hover:bg-coffee-100 text-coffee-600">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Campaigns" value={campaigns.length} color="coffee" />
              <StatCard label="Total Messages" value={campaigns.reduce((s, c) => s + (c.stats?.total || 0), 0)} color="blue" />
              <StatCard label="Conversions" value={campaigns.reduce((s, c) => s + (c.stats?.conversions || 0), 0)} color="green" />
              <StatCard label="Attributed Revenue" value={`₹${totalAttributed.toLocaleString()}`} color="pulse" />
            </div>

            {campaigns.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center">
                <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-4" />
                <p className="text-coffee-500 text-lg">No campaigns yet</p>
                <p className="text-coffee-400 text-sm mt-1">Head to AI Copilot to launch your first campaign</p>
                <button onClick={() => setTab("copilot")} className="mt-4 px-6 py-2 rounded-xl bg-coffee-800 text-white text-sm font-semibold">
                  Open Copilot
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {campaigns.map((camp) => {
                  const s = camp.stats;
                  const funnelData = [
                    { name: "Sent", count: s.sent, fill: "#60a5fa" },
                    { name: "Delivered", count: s.delivered, fill: "#06b6d4" },
                    { name: "Read", count: s.read, fill: "#a78bfa" },
                    { name: "Opened", count: s.opened, fill: "#c084fc" },
                    { name: "Clicked", count: s.clicked, fill: "#22c55e" },
                    { name: "Ordered", count: s.conversions, fill: "#e85d4c" },
                  ];

                  return (
                    <div key={camp.id} className="glass-card rounded-2xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-coffee-900">{camp.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              camp.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            }`}>
                              {camp.status}
                            </span>
                          </div>
                          <p className="text-sm text-coffee-500 mt-1">
                            <span className="font-semibold" style={{ color: CHANNEL_COLORS[camp.channel] }}>{camp.channel}</span>
                            {" · "}{s.total} messages · {s.conversionRate}% conversion
                          </p>
                        </div>
                        <button
                          onClick={() => openCampaign(camp.id)}
                          className="text-sm text-coffee-600 hover:text-coffee-800 font-medium flex items-center gap-1"
                        >
                          Details <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-8 gap-3 mb-6">
                        {[
                          ["Queued", s.queued || 0, "coffee"],
                          ["Sent", s.sent, "blue"],
                          ["Delivered", s.delivered, "blue"],
                          ["Read", s.read, "purple"],
                          ["Opened", s.opened, "purple"],
                          ["Clicked", s.clicked, "green"],
                          ["Failed", s.failed, "red"],
                          ["Revenue", `₹${s.attributedRevenue}`, "pulse"],
                        ].map(([label, val, color]) => (
                          <StatCard key={label} label={label} value={val} color={color} />
                        ))}
                      </div>

                      <div className="h-48 bg-coffee-50/50 rounded-xl p-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={funnelData} layout="vertical" margin={{ left: 10, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {funnelData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "dashboard" && selectedCampaign && (
          <div className="max-w-6xl mx-auto p-8">
            <button
              onClick={() => setSelectedCampaign(null)}
              className="text-sm text-coffee-600 hover:text-coffee-800 mb-4 flex items-center gap-1"
            >
              ← Back to campaigns
            </button>

            <h2 className="text-2xl font-bold text-coffee-900 mb-2">{selectedCampaign.name}</h2>
            <p className="text-coffee-500 mb-6">{selectedCampaign.goal}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Conversion Rate" value={`${selectedCampaign.stats.conversionRate}%`} color="green" />
              <StatCard label="Attributed Revenue" value={`₹${selectedCampaign.stats.attributedRevenue.toLocaleString()}`} color="pulse" />
              <StatCard label="Clicked" value={selectedCampaign.stats.clicked} color="blue" />
              <StatCard label="Failed" value={selectedCampaign.stats.failed} color="red" />
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-sm mb-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-coffee-800">
                <Smartphone className="w-4 h-4 text-coffee-500" /> Interactive Channel Preview
              </h3>
              <div className="bg-coffee-50/30 p-6 rounded-xl border border-coffee-100 flex items-center justify-center">
                <MessageMockup 
                  channel={selectedCampaign.channel} 
                  message={selectedCampaign.message} 
                />
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 shadow-sm overflow-x-auto">
              <h3 className="font-semibold mb-4">Communication Timeline</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-coffee-500 border-b">
                    <th className="pb-2 pr-4">Shopper</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Events</th>
                    <th className="pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaign.communications?.slice(0, 30).map((comm) => (
                    <tr key={comm.id} className="border-b border-coffee-50">
                      <td className="py-2.5 pr-4 font-medium">{comm.customer?.name}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          comm.status === "ORDER_ATTRIBUTED" ? "bg-green-100 text-green-700" :
                          comm.status === "FAILED" ? "bg-red-100 text-red-700" :
                          "bg-coffee-100 text-coffee-700"
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex gap-1 flex-wrap">
                          {comm.events?.map((ev) => (
                            <span key={ev.id} className="text-[10px] px-1.5 py-0.5 bg-coffee-50 rounded text-coffee-500 border border-coffee-100">
                              {ev.status}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5">
                        {comm.attributedAmount ? (
                          <span className="flex items-center gap-1 text-green-700 font-medium">
                            <IndianRupee className="w-3 h-3" />{comm.attributedAmount}
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "addData" && (
          <div className="max-w-4xl mx-auto p-8 animate-fade-up">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-coffee-900 font-display">Data Ingestion</h2>
              <p className="text-coffee-500 mt-1">
                Expand customer database — manually add shoppers and record coffee orders. RFM vitals and segments update instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card rounded-2xl p-6 shadow-sm border border-coffee-100 bg-white/95">
                <div className="flex items-center gap-2 text-coffee-800 font-semibold mb-6 text-lg border-b border-coffee-50 pb-3">
                  <PlusCircle className="w-5 h-5 text-coffee-500" />
                  Add New Shopper
                </div>

                <form onSubmit={handleAddShopper} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={newShopper.name}
                      onChange={(e) => setNewShopper({ ...newShopper, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. aarav.sharma@example.com"
                      value={newShopper.email}
                      onChange={(e) => setNewShopper({ ...newShopper, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="e.g. +919876543210"
                      value={newShopper.phone}
                      onChange={(e) => setNewShopper({ ...newShopper, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai"
                      value={newShopper.city}
                      onChange={(e) => setNewShopper({ ...newShopper, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-coffee-800 text-white font-semibold hover:bg-coffee-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-sm text-sm font-display"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Ingest Shopper
                  </button>
                </form>
              </div>

              <div className="glass-card rounded-2xl p-6 shadow-sm border border-coffee-100 bg-white/95">
                <div className="flex items-center gap-2 text-coffee-800 font-semibold mb-6 text-lg border-b border-coffee-50 pb-3">
                  <PlusCircle className="w-5 h-5 text-coffee-500" />
                  Record New Order
                </div>

                <form onSubmit={handleAddOrder} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Select Shopper *</label>
                    <select
                      required
                      value={newOrder.customerId}
                      onChange={(e) => setNewOrder({ ...newOrder, customerId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-white text-sm"
                    >
                      <option value="">-- Choose Shopper --</option>
                      {shoppersList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Order Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 1500"
                      value={newOrder.amount}
                      onChange={(e) => setNewOrder({ ...newOrder, amount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-coffee-600 uppercase tracking-wider block mb-1">Product Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Monsoon Malabar 250g"
                      value={newOrder.product}
                      onChange={(e) => setNewOrder({ ...newOrder, product: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-coffee-200 outline-none focus:ring-2 focus:ring-coffee-400 bg-coffee-50/20 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-coffee-800 text-white font-semibold hover:bg-coffee-700 disabled:opacity-40 transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-sm text-sm font-display"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                    Record Purchase
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {notification && (
        <div className={`fixed bottom-5 right-5 z-50 overflow-hidden flex flex-col rounded-2xl border shadow-2xl animate-slide-in select-none w-80 ${
          notification.type === 'success' 
            ? 'bg-white text-slate-800 border-green-200' 
            : 'bg-white text-slate-800 border-red-200'
        }`}>
          <div className="flex items-center gap-3 px-5 py-4 relative">
            {notification.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {notification.type === 'success' ? 'Notification' : 'Error Alert'}
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-snug break-words">
                {notification.message}
              </p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className={`h-1 w-full toast-progress ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      )}
    </div>
  );
}
