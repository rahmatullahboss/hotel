"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-10 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonChart({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>
      {/* Fake bar chart */}
      <div className="flex items-end gap-2 h-40">
        {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-3">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <Skeleton key={day} className="h-3 w-6" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, className = "" }: SkeletonProps & { rows?: number }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-4 bg-gray-50 border-b border-gray-100">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20 ml-auto" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-none"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonQuickActions({ className = "" }: SkeletonProps) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-6 gap-4 ${className}`}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-white"
        >
          <Skeleton className="w-8 h-8 rounded-full mb-2" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      {/* Left Column */}
      <div className="lg:col-span-8 space-y-8">
        {/* Header */}
        <div>
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Quick Actions */}
        <SkeletonQuickActions />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        {/* Table */}
        <SkeletonTable rows={5} />
      </div>

      {/* Right Column */}
      <div className="lg:col-span-4 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
