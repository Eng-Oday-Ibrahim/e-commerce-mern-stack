import { cn } from "@/lib/utils/cn";

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Drawer({
  open,
  onClose,
  children,
}: DrawerProps) {
  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-4 border-b">Filters</div>

        <div className="p-4">{children}</div>
      </div>
    </>
  );
}


{/*
    how to use:
    <Drawer open={open} onClose={() => setOpen(false)}>
  <Input placeholder="Search" />
  <Checkbox label="In stock" />
</Drawer>
    */}