import { cn } from "@/lib/utils/cn";

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 border-b border-black/10",
        className
      )}
    >
      {children}
    </div>
  );
}