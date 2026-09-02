import React from 'react';
import { useAuth } from '../context/AuthContext';

export const MotionBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#FFFFFF]">
      {/* Light Mode Pure White Background */}
      <div className="absolute inset-0 bg-[#FFFFFF]"></div>
    </div>
  );
};
