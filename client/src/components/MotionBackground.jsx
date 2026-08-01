import React from 'react';
import { useAuth } from '../context/AuthContext';

export const MotionBackground = () => {
  const { effectiveTheme } = useAuth();

  if (effectiveTheme === 'light') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#F8FAFC]">
        {/* Light Mode Clean Slate Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200/50 via-[#F8FAFC] to-[#F1F5F9]"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0A0C10]">
      {/* Dark Mode Cinema Charcoal Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#0A0C10] to-[#07080B]"></div>
    </div>
  );
};
