import React from 'react';

const MainArticleSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden my-6 md:my-8 animate-pulse">
      <div className="md:flex">
        <div className="md:w-1/2 bg-gray-300 dark:bg-gray-700 h-64 md:h-auto"></div>
        <div className="p-6 md:p-8 flex flex-col justify-between md:w-1/2">
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="mt-4 h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            <div className="mt-2 h-6 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="mt-6 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
            </div>
          </div>
          <div className="mt-6">
             <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/5 mb-2"></div>
             <div className="flex flex-wrap gap-2 mt-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticleCardSkeleton: React.FC = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col animate-pulse">
            <div className="h-48 w-full bg-gray-300 dark:bg-gray-700"></div>
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
                    <div className="mt-2 h-5 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="mt-1 h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="mt-4 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                     <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export { MainArticleSkeleton, ArticleCardSkeleton };