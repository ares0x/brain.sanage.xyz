import type { ReactNode } from "react";

interface GameShellProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconColor: string;
  children: ReactNode;
  headerAction?: ReactNode;
  progressBar?: ReactNode;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function GameShell({
  title,
  subtitle,
  icon,
  iconColor,
  children,
  headerAction,
  progressBar,
}: GameShellProps) {
  const bgColor = hexToRgba(iconColor, 0.1);
  const borderColor = hexToRgba(iconColor, 0.15);

  return (
    <div className="mx-auto max-w-lg sm:max-w-xl w-full px-4 sm:px-5 py-5 sm:py-6">
      <div className="card-soft rounded-2xl p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: bgColor,
                borderColor: borderColor,
              }}
            >
              <span style={{ color: iconColor }}>{icon}</span>
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#3D2B1F]">{title}</h2>
              <p className="text-xs text-[#B5A99A]">{subtitle}</p>
            </div>
          </div>
          {headerAction}
        </div>

        {progressBar}

        {children}
      </div>
    </div>
  );
}
