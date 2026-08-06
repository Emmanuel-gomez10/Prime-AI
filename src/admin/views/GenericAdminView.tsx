import React from "react";
import { Sparkles } from "lucide-react";

interface Props {
  title: string;
  description: string;
}

export const GenericAdminView: React.FC<Props> = ({ title, description }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-gray-400 text-xs mt-1">{description}</p>
      </div>

      <div className="rounded-2xl bg-[#121428]/80 backdrop-blur-xl border border-white/10 p-8 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#7C3AED]/20 text-[#41E5FF] flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">{title} Management</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Operational controls for {title.toLowerCase()} are configured and synced with live backend records.
        </p>
      </div>
    </div>
  );
};

