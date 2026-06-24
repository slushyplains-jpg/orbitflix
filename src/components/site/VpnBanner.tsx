import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

// Replace YOUR_AFFILIATE_LINK with your actual NordVPN affiliate URL
// Get it at: https://affiliates.nordvpn.com
const NORDVPN_LINK = "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=YOUR_AFFILIATE_ID&url_id=902";

export function VpnBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (sessionStorage.getItem("vpn_banner_dismissed")) return;
    // Delay appearance so it doesn't interrupt the initial load
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setVisible(false);
    setDismissed(true);
    sessionStorage.setItem("vpn_banner_dismissed", "1");
  }

  if (dismissed || !visible) return null;

  return (
    <div
      className={`fixed bottom-24 left-0 right-0 z-30 flex justify-center px-4 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="flex w-full max-w-xl items-center gap-4 rounded-2xl border border-white/10 bg-[#0d0d12]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#4687FF]/20">
          <Shield className="h-4 w-4 text-[#4687FF]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white">Stream safely with NordVPN</p>
          <p className="mt-0.5 truncate text-[11px] text-white/50">
            Protect your connection while watching — 67% off today
          </p>
        </div>
        <a
          href={NORDVPN_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={dismiss}
          className="flex-shrink-0 rounded-full bg-[#4687FF] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90"
        >
          Get Deal
        </a>
        <button
          onClick={dismiss}
          className="flex-shrink-0 rounded-full p-1 text-white/30 transition-colors hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
