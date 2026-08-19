"use client";

import { useActionState, useState } from "react";

import { deleteVentureAction } from "@/lib/actions/deleteVenture";

const CONFIRM_WORD = "Confirm";

export function DeleteVentureForm({
  ventureId,
}: {
  ventureId: string;
}) {
  const [confirm, setConfirm] = useState("");
  const [state, formAction, pending] = useActionState(deleteVentureAction, {
    error: null,
  });

  return (
    <form action={formAction} className="danger-zone">
      <input type="hidden" name="ventureId" value={ventureId} />
      <p className="muted">
        Permanently delete this venture and its entire ledger. This cannot be
        undone.
      </p>
      <label className="danger-confirm-label" htmlFor="confirm-delete">
        Type <span className="confirm-phrase">{CONFIRM_WORD}</span> to delete
      </label>
      <input
        id="confirm-delete"
        name="confirm"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="settings-input"
        autoComplete="off"
        spellCheck={false}
        placeholder={CONFIRM_WORD}
      />
      <button
        type="submit"
        className="btn btn-danger"
        disabled={pending || confirm !== CONFIRM_WORD}
      >
        {pending ? "Deleting…" : "Delete venture"}
      </button>
      {state.error ? <p className="settings-error">{state.error}</p> : null}
    </form>
  );
}
