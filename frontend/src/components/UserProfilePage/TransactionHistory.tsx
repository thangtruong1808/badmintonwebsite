import React, { useState, useMemo } from "react";
import { FaArrowUp, FaArrowDown, FaGift, FaUndo } from "react-icons/fa";
import type { RewardPointTransaction } from "../../types/user";
import { formatPoints } from "../../utils/rewardPoints";

interface TransactionHistoryProps {
  transactions: RewardPointTransaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
}) => {
  const [filter, setFilter] = useState<"all" | "earned" | "spent">("all");

  const filteredTransactions = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => {
      if (filter === "earned") return tx.points > 0;
      return tx.points < 0;
    });
  }, [transactions, filter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <FaArrowUp className="text-green-600" size={20} />;
      case "spent":
        return <FaArrowDown className="text-red-600" size={20} />;
      case "bonus":
        return <FaGift className="text-yellow-600" size={20} />;
      case "refund":
        return <FaUndo className="text-blue-600" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-100 to-pink-200 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 font-huglove">
        Transactions List
      </h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "earned", "spent"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors font-calibri capitalize ${filter === tab
              ? "bg-rose-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Transaction List */}
      <div className="space-y-4 max-h-[560px] overflow-y-auto pr-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-calibri">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-shrink-0">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 font-calibri">
                      {transaction.description}
                    </h3>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600 font-calibri ml-11">
                    <p>
                      <span className="font-semibold">Event:</span> {transaction.eventTitle}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span> {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold font-calibri ${transaction.points > 0
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {transaction.points > 0 ? "+" : ""}
                  {formatPoints(transaction.points)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionHistory;
