import ActivityItem from "./activity-item";
import EmptyActivity from "./empty-activity";
import type { ActivityItemData } from "./activity-item";

type ActivityLogProps = {
  data?: ActivityItemData[];
  loading?: boolean;
};

export default function ActivityLog({
  data = [],
  loading = false,
}: ActivityLogProps) {
  return (
     
      <div className="overflow-y-auto px-10 py-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex gap-4 animate-pulse"
              >
                <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />

                <div className="flex-1 space-y-2">
                  <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <EmptyActivity />
        ) : (
          <ol className="relative border-s border-slate-200 dark:border-slate-700">
            {data.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </ol>
        )}
      </div>
  );
}
