"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

export function CrewSignupForm() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!phone.trim()) {
      setStatus("Enter your phone number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/crew-signups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!response.ok) throw new Error("Could not save your number.");
      setStatus("You are in the OUTRAN crew.");
      setPhone("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save your number.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">
      <form
        className="flex max-w-xl flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded border border-border-primary bg-black/24 px-4">
          <Phone size={16} className="text-accent-primary" />
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Phone number" />
        </label>
        <button disabled={loading} className="rounded bg-accent-primary px-5 py-3 text-sm font-black uppercase text-bg-primary disabled:opacity-60" type="submit">
          {loading ? "Joining..." : "Join crew"}
        </button>
      </form>
      {status && <p className="mt-3 text-sm font-semibold text-text-secondary">{status}</p>}
    </div>
  );
}
