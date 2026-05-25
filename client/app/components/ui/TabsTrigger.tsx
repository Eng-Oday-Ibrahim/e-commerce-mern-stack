import { cn } from "@/lib/utils/cn";
import { useTabs } from "./Tabs";

export function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const { value: active, setValue } = useTabs();

  const isActive = active === value;

  return (
    <button
      onClick={() => setValue(value)}
      className={cn(
        "px-4 py-2 text-sm transition-all border-b-2",
        isActive
          ? "border-gold text-black"
          : "border-transparent text-gray-500 hover:text-black"
      )}
    >
      {children}
    </button>
  );
}