"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Share2,
  ImageIcon,
  Copy,
  Check,
  ClipboardCopy,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateShareCard,
  downloadCard,
  copyCardToClipboard,
  type ShareCardData,
} from "./share-card-canvas";
import { formatShareText } from "./share-message";

interface ShareDialogProps {
  data: ShareCardData;
  filename?: string;
}

export function ShareButton({
  data,
  filename = "brain-sanage-card.png",
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleOpen = useCallback(async () => {
    setOpen(true);
    setLoading(true);
    setCopiedImage(false);
    setCopiedText(false);
    const url = await generateShareCard(data);
    setDataUrl(url);
    setLoading(false);
  }, [data]);

  const handleDownload = useCallback(() => {
    if (dataUrl) {
      downloadCard(dataUrl, filename);
    }
  }, [dataUrl, filename]);

  const handleCopyImage = useCallback(async () => {
    if (!dataUrl) return;
    const ok = await copyCardToClipboard(dataUrl);
    if (ok) {
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  }, [dataUrl]);

  const handleCopyText = useCallback(() => {
    if (data.type !== "game") return;
    const text = formatShareText(data);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  }, [data]);

  const shareText =
    data.type === "game" ? formatShareText(data) : null;

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="outline"
        className="rounded-xl border-[#EDE5DB] text-[#3D2B1F] hover:bg-[#FAF7F4] hover:border-[#DDD5CC] text-sm font-medium h-10 px-4"
      >
        <Share2 className="w-4 h-4 mr-1.5" />
        分享
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", damping: 24, stiffness: 320 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDE5DB]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(212,132,124,0.1)] border border-[rgba(212,132,124,0.15)] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#D4847C]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#3D2B1F]">
                    生成分享卡片
                  </h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FAF7F4] transition-colors"
                >
                  <X className="w-4 h-4 text-[#8B7E74]" />
                </button>
              </div>

              {/* Preview */}
              <div className="p-5 flex justify-center bg-gradient-to-b from-[#FDF8F3] to-[#FAF5EF]">
                {loading ? (
                  <div className="w-[240px] h-[427px] bg-[#F5F0EB] rounded-2xl animate-pulse flex flex-col items-center justify-center gap-3">
                    <ImageIcon className="w-10 h-10 text-[#DDD5CC]" />
                    <span className="text-xs text-[#B5A99A]">
                      正在绘制卡片…
                    </span>
                  </div>
                ) : dataUrl ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <img
                      src={dataUrl}
                      alt="分享卡片预览"
                      className="w-[240px] rounded-2xl shadow-lg"
                    />
                    {/* Subtle shine effect overlay */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/15" />
                  </motion.div>
                ) : (
                  <div className="w-[240px] h-[427px] bg-[#F5F0EB] rounded-2xl flex items-center justify-center">
                    <p className="text-xs text-[#B5A99A]">生成失败，请重试</p>
                  </div>
                )}
              </div>

              {/* Share text snippet (game only) */}
              {shareText && (
                <div className="px-5 pb-3">
                  <div className="relative">
                    <textarea
                      ref={textRef}
                      readOnly
                      value={shareText}
                      className="w-full h-20 rounded-xl border border-[#EDE5DB] bg-[#FAF7F4] px-3 py-2.5 text-xs text-[#5A4A3F] leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-[#D4847C]/30"
                    />
                    <button
                      onClick={handleCopyText}
                      className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white border border-[#EDE5DB] flex items-center justify-center hover:bg-[#FAF7F4] transition-colors shadow-sm"
                      title="复制文案"
                    >
                      {copiedText ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#8B7E74]" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#B5A99A] mt-1.5 ml-0.5">
                    可复制文案搭配图片一起分享到朋友圈 / 小红书
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="px-5 pb-5 pt-1 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleDownload}
                    disabled={!dataUrl || loading}
                    className="bg-[#3D2B1F] hover:bg-[#2D1B0F] text-white rounded-xl text-sm font-medium h-11"
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    保存图片
                  </Button>
                  <Button
                    onClick={handleCopyImage}
                    disabled={!dataUrl || loading}
                    variant="outline"
                    className="rounded-xl border-[#EDE5DB] text-[#3D2B1F] hover:bg-[#FAF7F4] hover:border-[#DDD5CC] text-sm font-medium h-11"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="w-4 h-4 mr-1.5 text-green-600" />
                        已复制
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-4 h-4 mr-1.5" />
                        复制图片
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-center text-[#B5A99A]">
                  长按预览图也可直接保存 · 图片尺寸 1080×1920 适合小红书
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
