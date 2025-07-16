import React from "react";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="grid place-items-center min-h-[60vh] text-center">
      {/* Lapisan 1: Pola Latar Belakang */}
      <div className="col-start-1 row-start-1">
        <svg
          width="500"
          height="500"
          viewBox="0 0 480 480"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="opacity-5"
        >
          <g>
            <circle cx="240" cy="240" r="47.5" stroke="black" />
            <circle cx="240" cy="240" r="79.5" stroke="black" />
            <circle cx="240" cy="240" r="111.5" stroke="black" />
            <circle cx="240" cy="240" r="143.5" stroke="black" />
            <circle cx="240" cy="240" r="175.5" stroke="black" />
            <circle cx="240" cy="240" r="207.5" stroke="black" />
            <circle cx="240" cy="240" r="239.5" stroke="black" />
          </g>
        </svg>
      </div>

      {/* Lapisan 2: Ikon (dengan shadow) */}
      <div className="col-start-1 row-start-1 flex h-14 w-14 items-center justify-center rounded-lg border border-[#D5D7DA] [box-shadow:0px_1px_2px_0px_var(--ColorsEffectsShadowsshadow-xs),_0px_-2px_0px_0px_var(--ColorsEffectsShadowsshadow-skeumorphic-inner)_inset,_0px_0px_0px_1px_var(--ColorsEffectsShadowsshadow-skeumorphic-inner-border)_inset]">
        {icon}
      </div>

      {/* Lapisan 3: Teks (dipusatkan, lalu didorong ke bawah) */}
      <div className="col-start-1 row-start-1 flex flex-col items-center pt-48">
        <h2 className="text-xl font-bold text-foreground w-full">{title}</h2>
        <p className="mt-2 text-muted-foreground !max-w-md">{description}</p>
      </div>
    </div>
  );
}
