import React, { useState, useEffect, useCallback } from "react";
import { FaSpinner, FaDollarSign, FaCreditCard, FaExclamationTriangle, FaUndo, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "../../../utils/api";

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  averagePaymentAmount: number;
  totalRefunds: number;
  totalDisputes: number;
  disputeRate: number;
  revenueByMethod: {
    stripe: number;
    points: number;
    mixed: number;
  };
  revenueByStripeType: Record<string, number>;
  paymentsByStatus: {
    pending: number;
    completed: number;
    failed: number;
    refunded: number;
  };
  disputesByStatus: Record<string, number>;
  disputesByReason: Record<string, number>;
}

// Helper to get default date range (last 30 days)
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

const PIE_COLORS = ["#be123c", "#f472b6", "#fda4af", "#fb7185", "#fecdd3", "#9f1239"];
const BAR_COLORS = ["#fbbf24", "#22c55e", "#ef4444", "#6b7280"];

const STRIPE_TYPE_LABELS: Record<string, string> = {
  card: "Card",
  au_becs_debit: "BECS Direct Debit",
  link: "Link / Google Pay",
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  unknown: "Other",
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const PaymentStatsSection: React.FC = () => {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const res = await apiFetch(`/api/dashboard/payment-stats?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch payment stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment stats");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasStripeTypeData = stats && stats.revenueByStripeType && Object.keys(stats.revenueByStripeType).length > 0;
  const revenueByMethodData = stats
    ? (hasStripeTypeData
      ? Object.entries(stats.revenueByStripeType)
          .map(([type, value]) => ({
            name: STRIPE_TYPE_LABELS[type] || type.replace(/_/g, " "),
            value: Number(value),
          }))
          .filter(item => item.value > 0)
      : [
          { name: "Card/Stripe", value: stats.revenueByMethod.stripe },
          { name: "Points", value: stats.revenueByMethod.points },
          { name: "Mixed", value: stats.revenueByMethod.mixed },
        ].filter(item => item.value > 0))
    : [];

  const paymentsByStatusData = stats
    ? [
        { name: "Pending", value: stats.paymentsByStatus.pending, fill: BAR_COLORS[0] },
        { name: "Completed", value: stats.paymentsByStatus.completed, fill: BAR_COLORS[1] },
        { name: "Failed", value: stats.paymentsByStatus.failed, fill: BAR_COLORS[2] },
        { name: "Refunded", value: stats.paymentsByStatus.refunded, fill: BAR_COLORS[3] },
      ]
    : [];

  const hasDisputes = stats ? stats.totalDisputes > 0 : false;
  const disputesByStatusData = stats
    ? Object.entries(stats.disputesByStatus).map(([status, count]) => ({
        name: status.replace(/_/g, " "),
        count,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Date Range Filter and Apply Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="font-calibri font-semibold text-xl text-gray-800">Payment Statistics</h3>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <FaCalendarAlt className="text-gray-400 shrink-0" size={14} />
          <div className="flex items-center gap-2">
            <label className="font-calibri text-sm text-gray-600">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="font-calibri text-sm text-gray-600">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split("T")[0]}
              disabled={loading}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-calibri text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchStats()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed font-calibri text-sm font-medium transition-colors"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin shrink-0" size={14} aria-hidden />
                <span>Loading…</span>
              </>
            ) : (
              <span>Apply</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg font-calibri">
          <p className="font-medium">Error loading payment statistics</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchStats()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && !stats && (
        <div className="flex items-center justify-center py-12" role="status" aria-live="polite" aria-busy="true">
          <FaSpinner className="animate-spin text-rose-500 mr-2" size={20} aria-hidden />
          <span className="text-gray-600 font-calibri">Loading payment statistics…</span>
        </div>
      )}

      {stats && (
        <>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaDollarSign className="text-green-500" size={16} />
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Revenue
            </p>
          </div>
          <p className="font-calibri font-bold text-xl md:text-2xl text-gray-800">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaCreditCard className="text-rose-500" size={16} />
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Payments
            </p>
          </div>
          <p className="font-calibri font-bold text-xl md:text-2xl text-gray-800">
            {stats.totalPayments}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaChartLine className="text-blue-500" size={16} />
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Avg. Payment
            </p>
          </div>
          <p className="font-calibri font-bold text-xl md:text-2xl text-gray-800">
            {formatCurrency(stats.averagePaymentAmount)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaUndo className="text-gray-500" size={16} />
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Refunds
            </p>
          </div>
          <p className="font-calibri font-bold text-xl md:text-2xl text-gray-800">
            {stats.totalRefunds}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaExclamationTriangle className={`${stats.totalDisputes > 0 ? 'text-red-500' : 'text-gray-400'}`} size={16} />
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Disputes
            </p>
          </div>
          <p className={`font-calibri font-bold text-xl md:text-2xl ${stats.totalDisputes > 0 ? 'text-red-600' : 'text-gray-800'}`}>
            {stats.totalDisputes}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">%</span>
            <p className="font-calibri text-xs text-gray-500 uppercase tracking-wide">
              Dispute Rate
            </p>
          </div>
          <p className={`font-calibri font-bold text-xl md:text-2xl ${stats.disputeRate > 1 ? 'text-red-600' : 'text-gray-800'}`}>
            {stats.disputeRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Revenue by Payment Method and Payments by Status - side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <h4 className="font-calibri font-semibold text-gray-700 mb-4">Revenue by Payment Method</h4>
          {revenueByMethodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={revenueByMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontFamily: 'Calibri, sans-serif', fontSize: 12 }}
                >
                  {revenueByMethodData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  contentStyle={{ fontFamily: 'Calibri, sans-serif', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 font-calibri">
              No payment data for this period
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow border border-rose-100 p-4">
          <h4 className="font-calibri font-semibold text-gray-700 mb-4">Payments by Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paymentsByStatusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Calibri, sans-serif' }} />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Calibri, sans-serif' }}
                width={80}
              />
              <Tooltip 
                contentStyle={{ fontFamily: 'Calibri, sans-serif', fontSize: 13 }}
              />
              <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                {paymentsByStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Disputes Section (only shown if there are disputes) */}
      {hasDisputes && (
        <div className="bg-white rounded-xl shadow border border-red-100 p-4">
          <h4 className="font-calibri font-semibold text-red-700 mb-4 flex items-center gap-2">
            <FaExclamationTriangle size={16} />
            Disputes Breakdown
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disputes by Status */}
            <div>
              <p className="font-calibri text-sm text-gray-600 mb-2">By Status</p>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={disputesByStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#6b7280', fontFamily: 'Calibri, sans-serif' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#6b7280', fontFamily: 'Calibri, sans-serif' }} />
                  <Tooltip 
                    contentStyle={{ fontFamily: 'Calibri, sans-serif', fontSize: 13 }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Disputes by Reason */}
            <div>
              <p className="font-calibri text-sm text-gray-600 mb-2">By Reason</p>
              <div className="space-y-2">
                {Object.entries(stats.disputesByReason).map(([reason, count]) => (
                  <div key={reason} className="flex justify-between items-center text-sm">
                    <span className="font-calibri text-gray-700 capitalize">{reason.replace(/_/g, " ")}</span>
                    <span className="font-calibri font-semibold text-red-600">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {loading && stats && (
        <div className="flex items-center justify-center gap-2 py-3" role="status" aria-live="polite" aria-busy="true">
          <FaSpinner className="animate-spin text-rose-500 shrink-0" size={18} aria-hidden />
          <span className="text-gray-600 font-calibri text-sm">Updating…</span>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default PaymentStatsSection;
