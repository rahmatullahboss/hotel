import { SearchResultsSkeleton } from "../components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        
        {/* Results Grid */}
        <SearchResultsSkeleton count={9} />
      </div>
    </div>
  );
}
