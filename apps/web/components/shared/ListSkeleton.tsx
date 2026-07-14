import { Skeleton } from "@repo/ui/components/ui/skeleton";

const DEFAULT_ITEMS = 3;

interface ListSkeletonProps {
  items?: number;
  itemClassName?: string;
}

export function ListSkeleton({ items = DEFAULT_ITEMS, itemClassName = "h-16 w-full" }: ListSkeletonProps) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: items }).map((_, index) => (
        <Skeleton key={index} className={itemClassName} />
      ))}
    </div>
  );
}
