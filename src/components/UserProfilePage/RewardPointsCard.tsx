import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import type { User } from "../../types/user";
import { formatPoints } from "../../utils/rewardPoints";

interface RewardPointsCardProps {
  user: User;
}

const RewardPointsCard: React.FC<RewardPointsCardProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-6 shadow-lg text-white w-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaCoins size={32} className="text-yellow-200" />
          <h2 className="text-xl font-bold font-huglove">Reward Points with ChibiBadminton</h2>
        </div>
      </div>

      <div className="text-5xl font-bold mb-6 font-calibri">
        {formatPoints(user.rewardPoints)}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-yellow-300">
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaArrowUp className="text-green-200" size={16} />
            <span className="text-sm font-semibold font-calibri">Earned</span>
          </div>
          <div className="text-xl font-bold font-calibri">
            {formatPoints(user.totalPointsEarned)}
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <FaArrowDown className="text-red-200" size={16} />
            <span className="text-sm font-semibold font-calibri">Spent</span>
          </div>
          <div className="text-xl font-bold font-calibri">
            {formatPoints(user.totalPointsSpent)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardPointsCard;
