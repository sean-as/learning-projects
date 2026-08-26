import { RealtimeDemo } from "./realtime-demo";

export default async function RealtimeDemoPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  return (
    <main>
      <h1>Realtime demo</h1>
      <p>
        Open this page in two tabs; adding a row in one should appear in the
        other within ~1s.
      </p>
      <RealtimeDemo boardId={boardId} />
    </main>
  );
}
