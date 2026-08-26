"use client";

import { useState } from "react";
import { useBoardRealtime } from "@/lib/use-board-realtime";
import { castVote } from "./vote-actions";

type ClusterRow = { id: string; board_id: string; name: string };
type VoteRow = { id: string; cluster_id: string; participant_id: string; board_id: string };
type Card = { id: string; content: string; category: string; author: string | null };

const VOTE_BUDGET = 3;

export function VoteBoard({
  boardId,
  participantId,
  cards,
  cardClusterByCard,
}: {
  boardId: string;
  participantId: string;
  cards: Card[];
  cardClusterByCard: Record<string, string>;
}) {
  const clusters = useBoardRealtime<ClusterRow>(boardId, "clusters");
  const votes = useBoardRealtime<VoteRow>(boardId, "votes");
  const [error, setError] = useState<string | null>(null);

  const myVotesUsed = votes.filter((vote) => vote.participant_id === participantId).length;
  const remaining = Math.max(0, VOTE_BUDGET - myVotesUsed);

  const tally = new Map<string, number>();
  for (const vote of votes) {
    tally.set(vote.cluster_id, (tally.get(vote.cluster_id) ?? 0) + 1);
  }

  const sortedClusters = [...clusters].sort(
    (a, b) => (tally.get(b.id) ?? 0) - (tally.get(a.id) ?? 0)
  );

  async function handleVote(clusterId: string) {
    const result = await castVote(boardId, clusterId);
    setError(result.error);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg bg-[var(--surface-tint)] px-4 py-2">
        <p className="text-sm font-medium text-[var(--text)]">Votes remaining: {remaining}</p>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>

      {sortedClusters.map((cluster) => {
        const memberCards = cards.filter((card) => cardClusterByCard[card.id] === cluster.id);
        const voteCount = tally.get(cluster.id) ?? 0;
        return (
          <section
            key={cluster.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--text)]">{cluster.name}</h3>
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
            <button
              onClick={() => handleVote(cluster.id)}
              disabled={remaining === 0}
              className="mt-3 rounded-md bg-[var(--primary)] px-4 py-1.5 text-sm font-medium text-[var(--text-on-primary)] hover:bg-[var(--primary-hover)] disabled:opacity-40"
            >
              Vote
            </button>
          </section>
        );
      })}
    </div>
  );
}
