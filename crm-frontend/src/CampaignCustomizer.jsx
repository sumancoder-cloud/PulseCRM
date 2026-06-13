import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Phone,
  Mail,
  Radio,
  Users,
  TrendingUp,
  Edit2,
  Check,
  X,
  ChevronDown,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const CHANNELS = [
  { id: "WHATSAPP", name: "WhatsApp", icon: Phone, color: "#25D366", description: "Highest engagement, personal" },
  { id: "SMS", name: "SMS", icon: MessageSquare, color: "#3b82f6", description: "Fast, reliable delivery" },
  { id: "EMAIL", name: "Email", icon: Mail, color: "#8b5cf6", description: "Rich formatting, detailed" },
  { id: "RCS", name: "RCS", icon: Radio, color: "#e85d4c", description: "Rich messaging, interactive" },
];

const CHANNEL_COLORS = {
  WHATSAPP: "#25D366",
  SMS: "#3b82f6",
  EMAIL: "#8b5cf6",
  RCS: "#e85d4c",
};

export function CampaignCustomizer({
  aiCampaign,
  aiSegment,
  chatGoal,
  onLaunch,
  loading,
}) {
  const [customMessage, setCustomMessage] = useState(aiCampaign?.message || "");
  const [selectedChannel, setSelectedChannel] = useState(aiCampaign?.channel || "WHATSAPP");
  const [discount, setDiscount] = useState(aiCampaign?.discount || 15);
  const [segmentCustomers, setSegmentCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [editMessage, setEditMessage] = useState(false);

  // Fetch customers for this segment
  useEffect(() => {
    if (!aiSegment?.segmentId) return;

    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const { data } = await axios.get(
          `${API_BASE}/segments/${aiSegment.segmentId}/customers`
        );
        setSegmentCustomers(data.customers || []);
      } catch (error) {
        console.error("Failed to load segment customers:", error);
      }
      setLoadingCustomers(false);
    };

    fetchCustomers();
  }, [aiSegment?.segmentId]);

  useEffect(() => {
    setCustomMessage(aiCampaign?.message || "");
    setSelectedChannel(aiCampaign?.channel || "WHATSAPP");
    setDiscount(aiCampaign?.discount || 15);
  }, [aiCampaign]);

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === segmentCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(segmentCustomers.map((c) => c._id));
    }
  };

  const handleLaunchCustom = () => {
    onLaunch({
      message: customMessage,
      channel: selectedChannel,
      discount,
      selectedUserIds: selectedCustomers.length > 0 ? selectedCustomers : undefined,
    });
  };

  const selectedChannelData = CHANNELS.find((c) => c.id === selectedChannel);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-sm border-l-4 border-l-green-500 animate-fade-up">
      <div className="flex items-center gap-2 text-green-700 font-semibold mb-6">
        <TrendingUp className="w-5 h-5" /> Campaign Customizer — Full Control
      </div>

      {/* Message Customization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-coffee-700">Message Content</label>
          <button
            onClick={() => setEditMessage(!editMessage)}
            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
          >
            {editMessage ? (
              <>
                <Check className="w-3 h-3" /> Lock
              </>
            ) : (
              <>
                <Edit2 className="w-3 h-3" /> Edit
              </>
            )}
          </button>
        </div>
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          disabled={!editMessage}
          className={`w-full px-4 py-3 rounded-xl border ${
            editMessage
              ? "border-blue-300 bg-blue-50 focus:ring-2 focus:ring-blue-300"
              : "border-coffee-200 bg-gray-50 cursor-not-allowed"
          } text-sm text-coffee-800 focus:outline-none`}
          rows="4"
          placeholder="Your message here (use {name} for personalization)"
        />
        <p className="text-xs text-gray-500 mt-2">💡 Use {'{name}'} placeholder for automatic personalization</p>
      </div>

      {/* Channel Selection */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-coffee-700 mb-3 block">Communication Channel</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const isSelected = selectedChannel === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel.id)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? "border-green-500 bg-green-50"
                    : "border-coffee-200 bg-white hover:border-coffee-300"
                }`}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: isSelected ? channel.color : "#999" }}
                />
                <span className="text-xs font-semibold">{channel.name}</span>
                <span className="text-[10px] text-gray-600 text-center">{channel.description}</span>
              </button>
            );
          })}
        </div>
        {selectedChannelData && (
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800">
            <strong>{selectedChannelData.name}</strong> selected — {selectedChannelData.description}
          </div>
        )}
      </div>

      {/* Discount Configuration */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-coffee-700 mb-3 block">Discount Percentage</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={discount}
            onChange={(e) => setDiscount(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex items-center gap-2 min-w-[100px]">
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 rounded border border-coffee-200 text-sm font-bold text-center"
            />
            <span className="text-lg font-bold text-green-600">%</span>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
          💰 Customers will see: "{discount}% OFF" in the message
        </div>
      </div>

      {/* Customer Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-coffee-700">
            Target Customers ({selectedCustomers.length} selected)
          </label>
          <button
            onClick={() => setShowCustomerList(!showCustomerList)}
            className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1"
          >
            <Users className="w-3 h-3" />
            {showCustomerList ? "Hide" : "Show"} Segment ({segmentCustomers.length})
          </button>
        </div>

        {showCustomerList && (
          <div className="border border-coffee-200 rounded-xl overflow-hidden bg-white">
            <div className="p-3 bg-coffee-50 border-b border-coffee-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCustomers.length === segmentCustomers.length && segmentCustomers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
                <span className="text-sm font-semibold text-coffee-700">
                  {selectedCustomers.length === segmentCustomers.length
                    ? "Deselect All"
                    : "Select All"}{" "}
                  ({segmentCustomers.length})
                </span>
              </label>
              <span className="text-xs text-gray-600">
                {selectedCustomers.length > 0
                  ? `${selectedCustomers.length} selected`
                  : "Use segment defaults"}
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {loadingCustomers ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading customers...</div>
              ) : segmentCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No customers in this segment</div>
              ) : (
                <div className="divide-y divide-coffee-100">
                  {segmentCustomers.map((customer) => (
                    <label
                      key={customer._id}
                      className="flex items-center gap-3 p-3 hover:bg-coffee-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer._id)}
                        onChange={() => handleSelectCustomer(customer._id)}
                        className="rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-coffee-900">{customer.name}</p>
                        <p className="text-xs text-gray-600">{customer.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-green-700">₹{customer.totalSpent?.toLocaleString() || 0}</p>
                        <p className="text-[10px] text-gray-500">{customer.orderCount} orders</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-coffee-50 border-t border-coffee-200 text-xs text-gray-700">
              <strong>Note:</strong> If no customers selected, campaign will use entire segment
            </div>
          </div>
        )}

        {selectedCustomers.length > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800">
            ✓ Campaign will be sent to {selectedCustomers.length} selected customers only
          </div>
        )}
      </div>

      {/* Launch Button */}
      <button
        onClick={handleLaunchCustom}
        disabled={loading || !customMessage.trim()}
        className="w-full py-4 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
      >
        <TrendingUp className="w-5 h-5" />
        {selectedCustomers.length > 0
          ? `Launch to ${selectedCustomers.length} Customers`
          : `Launch to ${aiSegment?.audienceSize || 0} Shoppers`}
      </button>

      {/* Preview Card */}
      <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white" key={`preview-${customMessage}-${selectedChannel}-${discount}`}>
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">💬 Live Preview</p>
        <div className="bg-white/10 rounded-lg p-3 text-sm text-white min-h-[60px] border border-white/20">
          <p className="whitespace-pre-wrap break-words">{customMessage.replace(/\{name\}/gi, "Aarav")}</p>
          <div className="mt-2 text-xs text-gray-300">
            📱 Channel: <span className="font-bold" style={{ color: CHANNEL_COLORS[selectedChannel] }}>{selectedChannel}</span>
            {discount > 0 && (
              <>
                {" "} | 💰 Discount: <span className="font-bold text-green-400">{discount}% OFF</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CampaignCustomizer;
