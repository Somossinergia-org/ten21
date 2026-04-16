"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function TopProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] h-0.5">
      <div className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 animate-[progress_0.8s_ease-out_forwards]" />
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
