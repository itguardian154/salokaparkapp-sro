import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import ActivityLog from "@/components/activity/activity-log";
import type { ActivityItemData } from "./activity-item";
import { MdWorkHistory } from "react-icons/md";

type ActivitySheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data?: ActivityItemData[];
};

export default function ActivitySheet({
  open,
  onOpenChange,
  data = [],
}: ActivitySheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-100 w-full sm:max-w-md flex flex-col"
      >
        <SheetHeader className="shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <MdWorkHistory className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Log Activity
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Riwayat aktivitas terbaru
              </p>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <ActivityLog data={data} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

