import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Checkbox } from "./Checkbox";

export type Column<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  getRowId: (row: T) => string;
  selectionEnabled?: boolean;
  selectedRows?: Set<string>;
  onSelectRow?: (id: string) => void;
  onSelectAll?: () => void;
  renderActions?: (row: T) => React.ReactNode;
  bulkToolbar?: React.ReactNode;
  noDataMessage?: React.ReactNode;
};

export default function DataTable<T>({
  data,
  columns,
  onRowClick,
  getRowId,
  selectionEnabled = false,
  selectedRows = new Set(),
  onSelectRow,
  onSelectAll,
  renderActions,
  bulkToolbar,
  noDataMessage,
}: Props<T>) {
  const ids = React.useMemo(() => data.map((r) => getRowId(r)), [data, getRowId]);
  const allSelected = selectionEnabled && data.length > 0 && ids.every((id) => selectedRows.has(id));
  const someSelected = selectionEnabled && ids.some((id) => selectedRows.has(id)) && !allSelected;

  const columnTemplate = columns.map((col) => col.width ?? "minmax(0, 1fr)").join(" ");
  const gridTemplate = selectionEnabled
    ? `40px ${columnTemplate}${renderActions ? " minmax(96px, auto)" : ""}`
    : `${columnTemplate}${renderActions ? " minmax(96px, auto)" : ""}`;

  const headerCheckbox = (
    <Checkbox
      checked={allSelected}
      indeterminate={someSelected}
      onChange={onSelectAll}
      onClick={(e) => e.stopPropagation()}
    />
  );

  return (
    <div className="rounded border border-black/10 overflow-x-auto w-full">
      {selectionEnabled && bulkToolbar != null && selectedRows.size > 0 ? (
        <div className="border-b border-black/10 bg-black/[0.03] p-1.5 text-xs sm:p-1">{bulkToolbar}</div>
      ) : null}

      <div className="hidden sm:grid bg-black/5 p-1.5 text-xs font-medium sm:p-1 lg:p-2">
        <div className="grid items-center gap-1" style={{ gridTemplateColumns: gridTemplate }}>
          {selectionEnabled ? <div className="flex items-center">{headerCheckbox}</div> : null}
          {columns.map((col) => (
            <div key={String(col.key)} className="min-w-0 truncate">
              {col.header}
            </div>
          ))}
          {renderActions ? <div className="text-right">Actions</div> : null}
        </div>
      </div>

      <div className="divide-y divide-black/10">
        {data.length === 0 ? (
          <div className="grid gap-1 p-4 text-sm text-black/60">
            {noDataMessage ?? "No rows available."}
          </div>
        ) : (
          data.map((row, i) => {
            const id = getRowId(row);
            const isSelected = selectedRows.has(id);

            return (
              <div
                key={id ?? i}
                className={cn(
                  "grid gap-1 p-1 text-xs hover:bg-black/5 cursor-default sm:px-3 sm:py-2.5 lg:px-4 lg:py-3"
                )}
                onClick={() => onRowClick?.(row)}
              >
                <div className="hidden sm:grid items-center gap-1" style={{ gridTemplateColumns: gridTemplate }}>
                  {selectionEnabled ? (
                    <div
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onSelectRow?.(id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  ) : null}

                  {columns.map((col) => (
                    <div key={String(col.key)} className="min-w-0 truncate">
                      {col.render ? col.render(row) : String(row[col.key] ?? "")}
                    </div>
                  ))}

                  {renderActions ? (
                    <div
                      className="flex flex-wrap justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {renderActions(row)}
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:hidden">
                  {selectionEnabled ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onSelectRow?.(id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-xs font-medium uppercase tracking-[0.25em] text-black/70">Select</span>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-3">
                    {columns.map((col) => (
                      <div key={String(col.key)} className="grid gap-1 rounded-lg bg-white/90 p-3 border border-black/5">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-black/50">{col.header}</span>
                        <div className="text-sm font-medium text-black/90">
                          {col.render ? col.render(row) : String(row[col.key] ?? "")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {renderActions ? (
                    <div className="flex flex-wrap justify-end gap-1">
                      {renderActions(row)}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
