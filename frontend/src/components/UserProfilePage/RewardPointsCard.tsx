import React from "react";
import { FaCoins, FaArrowUp, FaArrowDown } from "react-icons/fa";
import type { User } from "../../types/user";
import { formatPoints } from "../../utils/rewardPoints";

interface RewardPointsCardProps {
  user: User;
}

const RewardPointsCard: React.FC<RewardPointsCardProps> = ({ user }) => {
  return (
    <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-4 sm:p-6 shadow-lg text-white flex flex-col w-full min-w-0 max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] aspect-[1.586]">
      <div className="flex items-center justify-between mb-3 sm:mb-4 w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <FaCoins className="text-yellow-200 flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8" size={32} />
          <h2 className="text-xl sm:text-3xl font-bold font-calibri">Chibi Tokens</h2>
        </div>
      </div>

      <div className="text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 font-calibri">
        {formatPoints(user.rewardPoints)}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-3 sm:pt-4 border-t border-yellow-300">
        <div className="bg-white bg-opacity-20 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <FaArrowUp className="text-green-300 flex-shrink-0" size={14} />
            <span className="text-base sm:text-lg font-semibold font-calibri">Earned</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-calibri">
            {formatPoints(user.totalPointsEarned)}
          </div>
        </div>
        <div className="bg-white bg-opacity-20 rounded-lg p-2 sm:p-3">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <FaArrowDown className="text-red-400 flex-shrink-0" size={14} />
            <span className="text-base sm:text-lg font-semibold font-calibri">Spent</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-calibri">
            {formatPoints(user.totalPointsSpent)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardPointsCard;
