import { useTabs } from "./Tabs";
import { cn } from "@/lib/utils/cn";

export function TabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { value: active } = useTabs();

  if (active !== value) return null;

  return (
    <div className={cn("pt-6 animate-fadeSlideUp")}>
      {children}
    </div>
  );
}