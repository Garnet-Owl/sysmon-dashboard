import { Suspense } from "react";
import ActivityGraph from "./components/Dashboard/ActivityGraph";
import RecentActivity from "./components/Dashboard/RecentActivity";
import StatsCards from "./components/Dashboard/StatsCards";

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Sysmon Activity Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time system monitoring and analysis
          </p>
        </header>

        <section>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Suspense fallback={<LoadingSpinner />}>
              <StatsCards />
            </Suspense>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Suspense fallback={<LoadingSpinner />}>
            <ActivityGraph />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentActivity />
          </Suspense>
        </section>
      </div>
    </main>
  );
}
