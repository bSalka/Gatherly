export default function EventCardSkeleton() {
  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200
      dark:border-gray-200 rounded-xl
        overflow-hidden flex flex-col animate-pulse"
    >
      {/*Image placeholder */}
      <div className="h-44 bg-gray-200 dark:bg-gray-700"></div>

      {/*Content placeholder */}
      <div className="p-4 flex flex-col gap-3">
        {/*Title */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>

        {/*Date */}
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/5"></div>

        {/*City*/}
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/3"></div>

        {/*Price */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:bg-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
}
