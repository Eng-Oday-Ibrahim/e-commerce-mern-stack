type BulkActionsProps = {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onAddToCategory?: () => void;
  onExport?: () => void;
};

export default function BulkActions({
  selectedCount,
  onClear,
  onDelete,
  onAddToCategory,
  onExport,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-black/10 shadow-lg rounded-full px-6 py-3 flex items-center gap-4">
      <span className="text-sm">
        {selectedCount} selected
      </span>

      <button
        onClick={onDelete}
        className="text-red-500 text-sm"
      >
        Delete
      </button>

      {onAddToCategory && (
        <button onClick={onAddToCategory} className="text-sm">
          Category
        </button>
      )}

      {onExport && (
        <button onClick={onExport} className="text-sm">
          Export
        </button>
      )}

      <button
        onClick={onClear}
        className="text-sm text-gray-500"
      >
        Clear
      </button>
    </div>
  );
}