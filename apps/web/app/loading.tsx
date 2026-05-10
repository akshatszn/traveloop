import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto grid min-h-screen max-w-7xl content-center gap-4 px-4">
      <Skeleton className="h-12 w-72" />
      <Skeleton className="h-5 w-96 max-w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </main>
  );
}
