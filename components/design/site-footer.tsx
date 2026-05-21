"use client";

import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import { GAMES_META } from "@/config/games";

const gameLinkKeys = [
  "reaction-time",
  "attention-span",
  "stroop-test",
  "go-nogo",
  "schulte-grid",
  "nback-memory",
  "digit-span",
] as const;

const gameLinks = gameLinkKeys.map((key) => GAMES_META[key]);

const resourceLinks = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于我们" },
  { href: "/guide", label: "使用指南" },
];

const legalLinks = [
  { href: "/privacy", label: "隐私政策" },
  { href: "/terms", label: "使用条款" },
  { href: "/cookies", label: "Cookie 政策" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background-soft">
      {/* Medical Disclaimer Banner */}
      <div className="border-b border-border bg-background-warm">
        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 sm:px-5 py-3.5">
          <div className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-secondary-foreground">免责声明：</span>
              本网站内容仅供信息参考和认知能力自测，不构成医疗建议、诊断或治疗。测试结果不代表临床评估结论。如有注意力缺陷（ADHD/ADD）、记忆障碍或其他健康方面的医疗需求，请咨询专业医生 or 医疗机构。
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 sm:px-5 py-8 sm:py-10">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-background-soft border border-border flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-serif text-sm font-bold text-foreground">
                Brain<span className="text-primary">.</span>Sanage
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              基于经典认知心理学实验范式的在线评估工具，帮助你科学地了解注意力、工作记忆与执行功能。
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-secondary mb-4">
              <Heart className="w-3.5 h-3.5" />
              <span>纯前端运行，数据不上传</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
              {resourceLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-secondary-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Games Column */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              认知测评
            </h4>
            <ul className="space-y-2">
              {gameLinks.map((game) => (
                <li key={game.href}>
                  <Link
                    href={game.href}
                    className="group flex items-center gap-2 text-xs text-muted-foreground hover:text-secondary-foreground transition-colors"
                  >
                    <game.icon
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: game.color }}
                    />
                    <span>{game.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              法律信息
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-secondary-foreground transition-colors inline-flex items-center gap-1"
                  >
                    {link.label}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-secondary">
            &copy; {new Date().getFullYear()} brain.sanage.xyz. All rights reserved.
          </p>
          <p className="text-xs text-muted-secondary">
            基于经典认知心理学实验范式 · 无账号模式 · 本地数据存储
          </p>
        </div>
      </div>
    </footer>
  );
}

