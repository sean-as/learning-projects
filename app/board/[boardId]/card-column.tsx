"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCard, deleteCard, type CardFormState } from "./card-actions";
import type { CardCategory } from "@/lib/card-validation";

const initialState: CardFormState = { error: null };

type Card = { id: string; content: string };

export function CardColumn({
  boardId,
  category,
  title,
  cards,
}: {
  boardId: string;
  category: CardCategory;
  title: string;
  cards: Card[];
}) {
  const boundAddCard = addCard.bind(null, boardId);
  const [state, formAction, pending] = useActionState(boundAddCard, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.error === null) {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
      <ul className="flex flex-col gap-2">
        {cards.map((card) => (
          <li
            key={card.id}
            className="flex items-start justify-between gap-2 rounded-md bg-[var(--surface-tint)] px-3 py-2 text-sm text-[var(--text)]"
          >
            <span>{card.content}</span>
            <form action={deleteCard.bind(null, boardId, card.id)}>
              <button
                type="submit"
                className="text-xs text-[var(--text-muted)] hover:text-red-600 dark:hover:text-red-400"
              >
                Delete
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form ref={formRef} action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="category" value={category} />
        <input
          type="text"
          name="content"
          maxLength={280}
          placeholder={`Add a ${category} card`}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        />
        {state.error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start rounded-md border border-[var(--border)] px-3 py-1.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-tint)] disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </form>
    </section>
  );
}
