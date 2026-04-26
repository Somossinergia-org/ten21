"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    }
    function onLeave() { setVisible(false); }
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseleave", onLeave); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100] w-[300px] h-[300px] rounded-full opacity-[0.04]"
      style={{
        left: pos.x - 150,
        top: pos.y - 150,
        background: "radial-gradient(circle, #06b6d4, transparent 70%)",
        transition: "left 0.1s, top 0.1s",
      }}
    />
  );
}
