"use client";

import { MessagesSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CommunityCard() {
  return (
    <Dialog>
      <DialogTrigger className="w-full text-left">
        <div className="bg-white rounded-2xl border border-[#EDE5DB] p-4 shadow-sm flex items-center gap-4 hover:border-[#D4847C40] transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#D4847C10]">
            <MessagesSquare className="w-5 h-5 text-[#D4847C]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[#3D2B1F]">训练社群</h3>
            <p className="text-xs text-[#8B7E74] mt-0.5">
              和小伙伴们一起打卡、交流训练心得
            </p>
          </div>
          <img
            src="/QRCode.JPG"
            alt="群聊二维码"
            className="w-12 h-12 rounded-lg object-cover border border-[#EDE5DB] shrink-0"
          />
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center font-serif text-[#3D2B1F]">
            加入训练社群
          </DialogTitle>
          <DialogDescription className="text-center text-[#8B7E74]">
            扫码加入微信群，一起坚持认知训练
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-2">
          <img
            src="/QRCode.JPG"
            alt="群聊二维码"
            className="w-56 h-56 rounded-xl object-cover border border-[#EDE5DB]"
          />
        </div>
        <p className="text-xs text-[#B5A99A] text-center">
          使用微信扫一扫即可加入
        </p>
      </DialogContent>
    </Dialog>
  );
}
