import { cn } from "@/lib/utils/cn";

export type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
};

export default function Table<T>({
  data,
  columns,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-black/10">
      {/* Header */}
      <div className="grid bg-black/5 p-4 text-sm font-medium">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
          }}
        >
          {columns.map((col) => (
            <div key={String(col.key)}>{col.header}</div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="divide-y">
        {data.map((row, i) => (
          <div
            key={i}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "grid p-4 text-sm hover:bg-black/5 cursor-pointer"
            )}
            style={{
              gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`,
            }}
          >
            {columns.map((col) => (
              <div key={String(col.key)}>
                {col.render
                  ? col.render(row)
                  : String(row[col.key])}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}