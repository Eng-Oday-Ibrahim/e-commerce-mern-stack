type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-black/5 mb-4" />

      <h3 className="text-lg font-medium text-black">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-gray-500 mt-2">
          {description}
        </p>
      )}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}


{/*
    How to use:
    {products.length === 0 ? (
   <EmptyState
     title="No products found"
     description="Try adjusting filters"
   />
 ) : (
   <DataTable ... />
 )}
*/}