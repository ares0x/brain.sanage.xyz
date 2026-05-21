"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Menu,
  X,
  ArrowRight,
  BarChart3,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GAMES_META } from "@/config/games";

const navGroups = [
  {
    title: "首页",
    items: [
      { href: "/", label: "首页", icon: Home, color: "#D4847C", desc: "探索认知测评工具" },
    ],
  },
  {
    title: "反应与注意",
    items: [
      { ...GAMES_META["reaction-time"], label: GAMES_META["reaction-time"].title },
      { ...GAMES_META["flanker"], label: GAMES_META["flanker"].title },
    ],
  },
  {
    title: "抑制控制",
    items: [
      { ...GAMES_META["go-nogo"], label: GAMES_META["go-nogo"].title },
      { ...GAMES_META["stroop-test"], label: GAMES_META["stroop-test"].title },
    ],
  },
  {
    title: "认知灵活",
    items: [
      { ...GAMES_META["task-switching"], label: GAMES_META["task-switching"].title },
    ],
  },
  {
    title: "专注力",
    items: [
      { ...GAMES_META["attention-span"], label: GAMES_META["attention-span"].title },
      { ...GAMES_META["schulte-grid"], label: GAMES_META["schulte-grid"].title },
    ],
  },
  {
    title: "记忆",
    items: [
      { ...GAMES_META["nback-memory"], label: GAMES_META["nback-memory"].title },
      { ...GAMES_META["digit-span"], label: GAMES_META["digit-span"].title },
    ],
  },
  {
    title: "放松",
    items: [
      { ...GAMES_META["breathing-478"], label: GAMES_META["breathing-478"].title },
    ],
  },
];

const infoLinks = [
  { href: "/profile", label: "训练档案", desc: "查看训练历史与进度", icon: BarChart3, color: "#5A9DE0" },
  { href: "/report", label: "认知报告", desc: "生成能力评估报告", icon: FileText, color: "#D4847C" },
  { href: "/about", label: "关于我们", desc: "设计理念与科学依据", icon: null, color: null },
  { href: "/guide", label: "使用指南", desc: "训练计划与技巧", icon: null, color: null },
];

const flatNavItems = navGroups.flatMap((g) => g.items);

function NavDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Desktop Panel — slides from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="hidden sm:flex fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-full bg-background border-l border-border flex-col shadow-2xl"
          >
            <DrawerContent pathname={pathname} onClose={onClose} />
          </motion.div>

          {/* Mobile Panel — slides from bottom */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="flex sm:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-background rounded-t-2xl shadow-2xl flex-col overflow-hidden"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" onClick={onClose}>
              <div className="w-10 h-1 rounded-full bg-accent-hover" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <DrawerContent pathname={pathname} onClose={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DrawerContent({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-background-soft border border-border-light flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-serif text-sm font-bold text-foreground">
            Brain<span className="text-primary">.</span>Sanage
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl bg-background-soft border border-border-light flex items-center justify-center text-muted-foreground hover:text-secondary-foreground transition-colors"
          aria-label="关闭菜单"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <h3 className="text-[11px] font-bold text-muted-secondary uppercase tracking-wider mb-2 px-1">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group",
                      isActive
                        ? "bg-primary/8 border border-primary/15"
                        : "hover:bg-background-soft border border-transparent"
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${item.color}12`,
                        border: `1px solid ${item.color}20`,
                      }}
                    >
                      <item.icon className="w-4 h-4" style={{ color: item.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          isActive ? "text-primary" : "text-foreground"
                        )}
                      >
                        {item.label}
                      </p>
                      <p className="text-xs text-muted-secondary truncate">{item.desc}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    {!isActive && (
                      <ArrowRight className="w-3.5 h-3.5 text-muted-secondary/80 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info Links */}
      <div className="px-5 py-4 border-t border-border">
        <h3 className="text-[11px] font-bold text-muted-secondary uppercase tracking-wider mb-2 px-1">
          更多
        </h3>
        <div className="space-y-1">
          {infoLinks.map((link) => {
            const isActive = pathname === link.href;
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                  isActive
                    ? "bg-primary/8 border border-primary/15"
                    : "hover:bg-background-soft border border-transparent"
                )}
              >
                {LinkIcon && link.color && (
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${link.color}12`,
                      border: `1px solid ${link.color}20`,
                    }}
                  >
                    <LinkIcon className="w-4 h-4" style={{ color: link.color }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", isActive ? "text-primary" : "text-foreground")}>
                    {link.label}
                  </p>
                  <p className="text-xs text-muted-secondary">{link.desc}</p>
                </div>
                {isActive ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 text-muted-secondary shrink-0" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-5 py-3 border-t border-border bg-background-soft">
        <p className="text-[11px] text-muted-secondary text-center">
          基于经典认知心理学实验范式 · 无账号模式
        </p>
      </div>
    </div>
  );
}

export function SiteNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentItem = flatNavItems.find((item) => item.href === pathname);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-6xl px-4 sm:px-5">
          <nav className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="relative w-9 h-9 rounded-xl bg-background-soft border border-border-light flex items-center justify-center shadow-sm">
                <img src="/logo.png" alt="" className="w-6 h-6 sm:w-5 sm:h-5 object-contain relative z-10" />
              </div>
              <span className="font-serif text-base font-bold text-foreground tracking-wide hidden sm:inline">
                Brain<span className="text-primary">.</span>Sanage
              </span>
            </Link>

            {/* Center — Current Page Indicator (desktop only) */}
            {currentItem && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <currentItem.icon className="w-4 h-4" style={{ color: currentItem.color }} />
                <span className="font-medium">{currentItem.label}</span>
              </div>
            )}

            {/* Menu Button */}
            <button
              onClick={() => setDrawerOpen(true)}
              className={cn(
                "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors min-h-[44px]",
                drawerOpen
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-secondary-foreground hover:bg-background-soft"
              )}
              aria-label="打开导航菜单"
              aria-expanded={drawerOpen}
            >
              <Menu className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">菜单</span>
              {currentItem && (
                <span className="hidden md:hidden sm:inline text-xs text-muted-secondary">
                  · {currentItem.label}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <NavDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
