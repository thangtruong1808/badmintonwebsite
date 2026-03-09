import React from "react";
import { FaGift } from "react-icons/fa";

const ChibiPerksComingSoon: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-xl p-4 sm:p-6 shadow-lg text-white flex flex-col w-full min-w-0 max-w-[320px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-[520px] xl:max-w-[560px] aspect-[1.586] justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <FaGift className="text-yellow-200 w-12 h-12 sm:w-16 sm:h-16 mb-4" />
        <p className="text-lg sm:text-xl md:text-2xl font-calibri font-medium leading-relaxed">
          Chibi perks feature is coming soon
        </p>
        <p className="text-sm sm:text-base text-yellow-100 mt-2 font-calibri">
          We&apos;re excited to bring you exciting rewards. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default ChibiPerksComingSoon;
