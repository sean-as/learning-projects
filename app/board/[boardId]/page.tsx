import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createParticipantClient } from "@/lib/supabase-server";
import { participantCookieName } from "@/lib/participant-validation";
import { checkIsFacilitator } from "@/lib/facilitator";
import { JoinForm } from "./join-form";
import { CardColumn } from "./card-column";
import { AdvancePhaseButton } from "./advance-phase-button";
import { BecomeFacilitatorButton } from "./become-facilitator-button";
import { ClusterBoard } from "./cluster-board";
import { VoteBoard } from "./vote-board";
import { DiscussBoard } from "./discuss-board";
import { CARD_CATEGORIES, type CardCategory } from "@/lib/card-validation";

type DisplayCard = { id: string; content: string; author?: string | null };
type FlatCard = { id: string; content: string; category: string; author: string | null };

const CATEGORY_TITLES: Record<CardCategory, string> = {
  start: "Start",
  stop: "Stop",
  continue: "Continue",
};

const PHASE_STYLES: Record<string, string> = {
  submit: "bg-highlight-100 text-neutral-800",
  cluster: "bg-highlight-400 text-neutral-900",
  vote: "bg-success-100 text-success-700",
  discuss: "bg-success-100 text-success-700",
  closed: "bg-neutral-200 text-neutral-700",
};

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id, phase, week, facilitator_participant_id")
    .eq("id", boardId)
    .single();

  if (!board) {
    // PGRST116 = genuinely zero rows. Any other error (timeout, connection
    // refused, etc.) is transient — don't render "not found" for those.
    if (boardError && boardError.code !== "PGRST116") {
      throw new Error(`Could not load board ${boardId}: ${boardError.message}`);
    }
    notFound();
  }

  const cookieStore = await cookies();
  const participantId = cookieStore.get(participantCookieName(boardId))?.value;

  let participant: { id: string; name: string | null; is_anonymous: boolean } | null = null;
  if (participantId) {
    const { data } = await supabase
      .from("participants")
      .select("id, name, is_anonymous")
      .eq("id", participantId)
      .eq("board_id", boardId)
      .single();
    participant = data ?? null;
  }

  if (!participant) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-2xl font-semibold text-[var(--text)]">Join board</h1>
        <div className="mt-4">
          <JoinForm boardId={boardId} />
        </div>
      </main>
    );
  }

  const isFacilitator = await checkIsFacilitator(boardId, participant.id);

  let facilitatorLabel: string | null = null;
  if (!isFacilitator && board.facilitator_participant_id) {
    const { data: facilitatorParticipant } = await supabase
      .from("participants")
      .select("name, is_anonymous")
      .eq("id", board.facilitator_participant_id)
      .single();
    facilitatorLabel = facilitatorParticipant
      ? facilitatorParticipant.is_anonymous
        ? "Anonymous"
        : (facilitatorParticipant.name ?? "Someone")
      : null;
  }

  const cardsByCategory: Record<CardCategory, DisplayCard[]> = {
    start: [],
    stop: [],
    continue: [],
  };

  if (board.phase === "submit") {
    const participantClient = createParticipantClient(participant.id);
    const { data: cards } = await participantClient
      .from("cards")
      .select("id, category, content")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    for (const card of cards ?? []) {
      cardsByCategory[card.category as CardCategory].push({ id: card.id, content: card.content });
    }
  }

  let flatCards: FlatCard[] = [];
  if (board.phase !== "submit") {
    const { data: cards } = await supabase
      .from("cards")
      .select("id, category, content, participants(name, is_anonymous)")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    flatCards = (cards ?? []).map((card) => {
      const author = card.participants as unknown as { name: string | null; is_anonymous: boolean } | null;
      return {
        id: card.id,
        content: card.content,
        category: card.category,
        author: author?.is_anonymous ? null : (author?.name ?? null),
      };
    });
  }

  let cardClusterByCard: Record<string, string> = {};
  if (board.phase === "vote" || board.phase === "discuss") {
    const { data: memberships } = await supabase
      .from("card_clusters")
      .select("card_id, cluster_id")
      .eq("board_id", boardId);
    for (const membership of memberships ?? []) {
      cardClusterByCard[membership.card_id] = membership.cluster_id;
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Board — week of {board.week}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Joined as {participant.is_anonymous ? "Anonymous" : participant.name}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            PHASE_STYLES[board.phase] ?? "bg-neutral-200 text-neutral-700"
          }`}
        >
          {board.phase}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        {isFacilitator ? (
          <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700">
            You are the facilitator
          </span>
        ) : (
          <>
            <span className="text-xs text-[var(--text-muted)]">
              {facilitatorLabel ? `Facilitated by ${facilitatorLabel}` : "No facilitator yet"}
            </span>
            <BecomeFacilitatorButton
              boardId={boardId}
              label={facilitatorLabel ? "Take over as facilitator" : "Become facilitator"}
            />
          </>
        )}
      </div>

      <div className="mt-8">
        {board.phase === "submit" ? (
          <section className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {CARD_CATEGORIES.map((category) => (
                <CardColumn
                  key={category}
                  boardId={boardId}
                  category={category}
                  title={CATEGORY_TITLES[category]}
                  cards={cardsByCategory[category]}
                />
              ))}
            </div>
            {isFacilitator && <AdvancePhaseButton boardId={boardId} label="Reveal all cards" />}
          </section>
        ) : board.phase === "cluster" ? (
          <div className="flex flex-col gap-6">
            <ClusterBoard boardId={boardId} cards={flatCards} />
            {isFacilitator && <AdvancePhaseButton boardId={boardId} label="Start voting" />}
          </div>
        ) : board.phase === "vote" ? (
          <div className="flex flex-col gap-6">
            <VoteBoard
              boardId={boardId}
              participantId={participant.id}
              cards={flatCards}
              cardClusterByCard={cardClusterByCard}
            />
            {isFacilitator && <AdvancePhaseButton boardId={boardId} label="Start discussion" />}
          </div>
        ) : board.phase === "discuss" ? (
          <div className="flex flex-col gap-6">
            <DiscussBoard boardId={boardId} cards={flatCards} cardClusterByCard={cardClusterByCard} />
            {isFacilitator && <AdvancePhaseButton boardId={boardId} label="Close board" />}
          </div>
        ) : (
          <p className="text-[var(--text-muted)]">This board is closed.</p>
        )}
      </div>
    </main>
  );
}
