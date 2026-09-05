"use client";

import { useActionState, useState } from "react";

import { FormError } from "@/app/components/FormError";
import { createVentureAction } from "@/lib/actions/createVenture";

export function NewVentureForm({ collapsible = false }: { collapsible?: boolean }) {
  const [open, setOpen] = useState(!collapsible);
  const [name, setName] = useState("");
  const [state, formAction, pending] = useActionState(createVentureAction, {
    error: null,
  });

  if (collapsible && !open) {
    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setOpen(true)}
      >
        New venture
      </button>
    );
  }

  return (
    <form className="venture-form" action={formAction}>
      <div className="field-group">
        <label className="field-label" htmlFor="venture-name">
          Name
        </label>
        <input
          id="venture-name"
          name="name"
          type="text"
          className="text-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder="e.g. BioBand"
          required
          autoFocus={collapsible}
        />
      </div>

      <div className="field-group">
        <label className="field-label" htmlFor="venture-tagline">
          Tagline <span className="muted">(optional)</span>
        </label>
        <input
          id="venture-tagline"
          name="tagline"
          type="text"
          className="text-input"
          placeholder="One line on what it is"
        />
      </div>

      <FormError>{state.error}</FormError>

      <div className="form-actions">
        <button
          type="submit"
          className={`btn btn-primary${pending ? " btn-loading" : ""}`}
          disabled={pending || !name.trim()}
        >
          {pending ? (
            <span className="btn-ellipsis">…</span>
          ) : (
            "Create venture"
          )}
        </button>
        {collapsible ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setOpen(false)}
            disabled={pending}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
