"use client";

import { useBoardRealtime } from "@/lib/use-board-realtime";
import { ActionItemForm } from "./action-item-form";
import { DecisionNotesForm } from "./decision-notes-form";

type ClusterRow = { id: string; board_id: string; name: string; decision_notes: string | null };
type VoteRow = { id: string; cluster_id: string; participant_id: string; board_id: string };
type ActionItemRow = {
  id: string;
  board_id: string;
  cluster_id: string | null;
  text: string;
  owner: string;
  due_date: string;
};
type Card = { id: string; content: string; category: string; author: string | null };

export function DiscussBoard({
  boardId,
  cards,
  cardClusterByCard,
}: {
  boardId: string;
  cards: Card[];
  cardClusterByCard: Record<string, string>;
}) {
  const clusters = useBoardRealtime<ClusterRow>(boardId, "clusters");
  const votes = useBoardRealtime<VoteRow>(boardId, "votes");
  const actionItems = useBoardRealtime<ActionItemRow>(boardId, "action_items");

  const tally = new Map<string, number>();
  for (const vote of votes) {
    tally.set(vote.cluster_id, (tally.get(vote.cluster_id) ?? 0) + 1);
  }

  const sortedClusters = [...clusters].sort(
    (a, b) => (tally.get(b.id) ?? 0) - (tally.get(a.id) ?? 0)
  );

  return (
    <div className="flex flex-col gap-6">
      {sortedClusters.map((cluster) => {
        const memberCards = cards.filter((card) => cardClusterByCard[card.id] === cluster.id);
        const clusterActionItems = actionItems.filter((item) => item.cluster_id === cluster.id);
        const voteCount = tally.get(cluster.id) ?? 0;

        return (
          <section
            key={cluster.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-[var(--text)]">{cluster.name}</h3>
              <span className="rounded-full bg-highlight-400 px-2.5 py-0.5 text-xs font-medium text-neutral-900">
                {voteCount} {voteCount === 1 ? "vote" : "votes"}
              </span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
              {memberCards.map((card) => (
                <li
                  key={card.id}
                  className="rounded-md bg-[var(--surface-tint)] px-3 py-1.5 text-sm text-[var(--text)]"
                >
                  {card.content}
                </li>
              ))}
            </ul>

            <h4 className="mt-4 text-sm font-semibold text-[var(--text)]">Decision notes</h4>
            <div className="mt-2">
              <DecisionNotesForm boardId={boardId} clusterId={cluster.id} initialNotes={cluster.decision_notes} />
            </div>

            <h4 className="mt-4 text-sm font-semibold text-[var(--text)]">Action items</h4>
            <ul className="mt-2 flex flex-col gap-1">
              {clusterActionItems.map((item) => (
                <li
                  key={item.id}
                  className="rounded-md bg-[var(--surface-tint)] px-3 py-2 text-sm text-[var(--text)]"
                >
                  {item.text} <span className="text-[var(--text-muted)]">— {item.owner} — due {item.due_date}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <ActionItemForm boardId={boardId} clusterId={cluster.id} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
