import { ListRows, PageChrome } from "@/components/app/page-skeleton";

export default function LogsLoading() {
  return (
    <div className="space-y-8">
      <PageChrome kicker="Field" title="Daily logs" />
      <section>
        <h2 className="text-lg font-semibold text-ink">Active flocks</h2>
        <div className="mt-4">
          <ListRows count={4} />
        </div>
      </section>
    </div>
  );
}
