import { Suspense } from "react";
import ActivityGraph from "./components/Dashboard/ActivityGraph";
import RecentActivity from "./components/Dashboard/RecentActivity";
import StatsCards from "./components/Dashboard/StatsCards";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Sysmon Activity Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Suspense fallback={<div>Loading stats...</div>}>
          <StatsCards />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Suspense fallback={<div>Loading graph...</div>}>
          <ActivityGraph />
        </Suspense>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Suspense fallback={<div>Loading recent activity...</div>}>
          <RecentActivity />
        </Suspense>
      </div>
    </main>
  );
}
