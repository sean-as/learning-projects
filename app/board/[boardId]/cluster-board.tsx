"use client";

import type { DragEvent } from "react";
import { useBoardRealtime } from "@/lib/use-board-realtime";
import { groupCardsIntoNewCluster, addCardToCluster, removeCardFromCluster } from "./cluster-actions";
import { ClusterNameForm } from "./cluster-name-form";

type Card = { id: string; content: string; category: string; author: string | null };
type ClusterRow = { id: string; board_id: string; name: string };
type CardClusterRow = { id: string; card_id: string; cluster_id: string; board_id: string };

export function ClusterBoard({ boardId, cards }: { boardId: string; cards: Card[] }) {
  const clusters = useBoardRealtime<ClusterRow>(boardId, "clusters");
  const memberships = useBoardRealtime<CardClusterRow>(boardId, "card_clusters");

  const clusterIdByCard = new Map(memberships.map((m) => [m.card_id, m.cluster_id]));
  const ungrouped = cards.filter((card) => !clusterIdByCard.has(card.id));

  function onDragStart(event: DragEvent, cardId: string) {
    event.dataTransfer.setData("text/plain", cardId);
  }

  function allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  function handleDropOnCard(event: DragEvent, targetCardId: string) {
    event.preventDefault();
    event.stopPropagation();
    const draggedCardId = event.dataTransfer.getData("text/plain");
    if (!draggedCardId || draggedCardId === targetCardId) {
      return;
    }
    const targetClusterId = clusterIdByCard.get(targetCardId);
    if (targetClusterId) {
      void addCardToCluster(boardId, draggedCardId, targetClusterId);
    } else {
      void groupCardsIntoNewCluster(boardId, draggedCardId, targetCardId);
    }
  }

  function handleDropOnCluster(event: DragEvent, clusterId: string) {
    event.preventDefault();
    const draggedCardId = event.dataTransfer.getData("text/plain");
    if (!draggedCardId) {
      return;
    }
    void addCardToCluster(boardId, draggedCardId, clusterId);
  }

  function handleDropOnUngrouped(event: DragEvent) {
    event.preventDefault();
    const draggedCardId = event.dataTransfer.getData("text/plain");
    if (!draggedCardId) {
      return;
    }
    void removeCardFromCluster(boardId, draggedCardId);
  }

  const cardChip = "cursor-move rounded-md bg-[var(--surface-tint)] px-3 py-2 text-sm text-[var(--text)]";

  return (
    <div className="flex flex-col gap-4">
      <section
        onDragOver={allowDrop}
        onDrop={handleDropOnUngrouped}
        className="rounded-lg border border-dashed border-[var(--border)] p-4"
      >
        <h3 className="text-sm font-semibold text-[var(--text)]">Ungrouped</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ungrouped.map((card) => (
            <li
              key={card.id}
              draggable
              onDragStart={(event) => onDragStart(event, card.id)}
              onDragOver={allowDrop}
              onDrop={(event) => handleDropOnCard(event, card.id)}
              className={cardChip}
            >
              {card.content} <span className="text-xs text-[var(--text-muted)]">({card.category})</span>
            </li>
          ))}
        </ul>
      </section>

      {clusters.map((cluster) => {
        const memberCards = cards.filter((card) => clusterIdByCard.get(card.id) === cluster.id);
        return (
          <section
            key={cluster.id}
            onDragOver={allowDrop}
            onDrop={(event) => handleDropOnCluster(event, cluster.id)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <ClusterNameForm boardId={boardId} clusterId={cluster.id} initialName={cluster.name} />
            <ul className="mt-3 flex flex-wrap gap-2">
              {memberCards.map((card) => (
                <li
                  key={card.id}
                  draggable
                  onDragStart={(event) => onDragStart(event, card.id)}
                  onDragOver={allowDrop}
                  onDrop={(event) => handleDropOnCard(event, card.id)}
                  className={cardChip}
                >
                  {card.content} <span className="text-xs text-[var(--text-muted)]">({card.category})</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
