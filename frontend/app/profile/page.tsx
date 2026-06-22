"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, CheckCircle2, LogOut, Mail, MapPin, Package, Pencil, Phone, ShieldCheck, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { getAddresses, updateProfile } from "@/lib/auth-api";

export default function ProfilePage() {
  const { user, loading, logout, openLogin, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [status, setStatus] = useState("");
  const { data: addresses = [] } = useQuery({
    queryKey: ["addresses"],
    queryFn: getAddresses,
    enabled: Boolean(user),
  });

  function openEditor() {
    if (!user) return;
    setName(user.name ?? "");
    setPhoneNumber(user.phone_number ?? "");
    setStatus("");
    setEditing(true);
  }

  async function save() {
    if (!name.trim() || !phoneNumber.trim()) {
      setStatus("Name and phone number are required.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), phone_number: phoneNumber.trim() });
      await refreshUser();
      setEditing(false);
      setStatus("Profile updated successfully.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="container-x pb-14 pt-28">
        <div className="cinematic-panel h-80 animate-pulse rounded-md" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container-x grid min-h-[70vh] place-items-center pb-14 pt-28 text-center">
        <div className="max-w-md">
          <UserRound className="mx-auto text-accent-primary" size={42} />
          <h1 className="mt-5 font-display text-5xl uppercase">Your rider account</h1>
          <p className="mt-3 text-text-secondary">Sign in to manage your profile and track every OUTRAN order.</p>
          <button onClick={openLogin} className="mt-6 rounded-md bg-accent-primary px-7 py-3.5 text-sm font-black uppercase text-bg-primary shadow-glow">
            Login to continue
          </button>
        </div>
      </main>
    );
  }

  const displayName = user.name ?? user.email.split("@")[0];
  const memberSince = user.created_at
    ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(user.created_at))
    : "OUTRAN rider";

  return (
    <main className="pb-16 pt-[72px]">
      <section className="border-b border-border-primary bg-surface-card/45">
        <div className="container-x grid gap-7 py-9 md:grid-cols-[auto_1fr_auto] md:items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative h-28 w-28 overflow-hidden rounded-md border border-accent-primary/70 bg-bg-primary shadow-glow"
          >
            {user.profile_image ? (
              <img src={user.profile_image} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center font-display text-5xl uppercase text-accent-primary">{displayName.slice(0, 1)}</div>
            )}
            <span className="absolute bottom-2 right-2 h-3 w-3 rounded-full border-2 border-bg-primary bg-success" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <p className="text-xs font-black uppercase text-accent-primary">Rider account</p>
            <h1 className="mt-1 font-display text-5xl uppercase leading-none md:text-6xl">{displayName}</h1>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-2"><Mail size={15} /> {user.email}</span>
              <span className="inline-flex items-center gap-2"><CalendarDays size={15} /> Member since {memberSince}</span>
            </div>
          </motion.div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            <button onClick={openEditor} className="inline-flex h-11 items-center gap-2 rounded-md bg-accent-primary px-5 text-sm font-black uppercase text-bg-primary shadow-glow transition hover:-translate-y-0.5 hover:bg-accent-hover">
              <Pencil size={16} /> Edit profile
            </button>
            <button onClick={logout} aria-label="Logout" title="Logout" className="grid h-11 w-11 place-items-center rounded-md border border-border-primary text-text-secondary transition hover:border-accent-primary hover:text-accent-primary">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="container-x grid gap-6 py-8 lg:grid-cols-[1.35fr_.65fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="cinematic-panel rounded-md p-5 md:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-border-primary pb-5">
            <div>
              <p className="text-xs font-black uppercase text-accent-primary">Personal details</p>
              <h2 className="mt-1 font-display text-3xl uppercase">Account information</h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded border border-success/40 bg-success/10 px-3 py-2 text-xs font-bold text-success">
              <CheckCircle2 size={14} /> Complete
            </span>
          </div>
          <div className="grid gap-px overflow-hidden rounded-md border border-border-primary bg-border-primary sm:grid-cols-2">
            <Info icon={UserRound} label="Full name" value={user.name ?? "Not set"} />
            <Info icon={Phone} label="Phone number" value={user.phone_number ?? "Not set"} />
            <Info icon={Mail} label="Email address" value={user.email} />
            <Info icon={ShieldCheck} label="Account status" value={user.profile_complete ? "Profile complete" : "Action required"} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="cinematic-panel rounded-md p-5 md:p-7">
          <div className="flex items-start justify-between gap-4 border-b border-border-primary pb-5">
            <div>
              <p className="text-xs font-black uppercase text-accent-primary">Saved address</p>
              <h2 className="mt-1 font-display text-3xl uppercase">Checkout addresses</h2>
            </div>
            <MapPin className="text-accent-primary" />
          </div>
          <div className="mt-5 grid gap-3">
            {addresses.length === 0 && <p className="text-sm text-text-secondary">No saved address yet. Your checkout address will appear here.</p>}
            {addresses.slice(0, 2).map((address) => (
              <div key={address.id} className="rounded border border-border-primary bg-black/18 p-4 text-sm leading-6 text-text-secondary">
                <b className="text-text-primary">{address.full_name}</b>
                <br />
                {address.address}
                <br />
                {address.city}, {address.state} - {address.pincode}
                <br />
                {address.phone}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="cinematic-panel rounded-md p-5 md:p-7">
          <p className="text-xs font-black uppercase text-accent-primary">Quick access</p>
          <h2 className="mt-1 font-display text-3xl uppercase">Your OUTRAN</h2>
          <div className="mt-5 grid gap-3">
            <QuickLink href="/orders" icon={Package} title="My orders" copy="Track and review purchases" />
            <QuickLink href="/cart" icon={ShoppingBag} title="Saved cart" copy="Continue building your kit" />
          </div>
        </motion.aside>
      </section>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
            <motion.section initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12 }} className="w-full max-w-lg rounded-md border border-border-primary bg-bg-secondary p-6 shadow-tactical md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-accent-primary">Account details</p>
                  <h2 className="mt-1 font-display text-4xl uppercase">Edit profile</h2>
                </div>
                <button onClick={() => setEditing(false)} aria-label="Close profile editor" className="grid h-10 w-10 place-items-center rounded-md border border-border-primary text-text-secondary hover:text-text-primary"><X size={18} /></button>
              </div>
              <div className="mt-6 grid gap-4">
                <Field label="Name" value={name} onChange={setName} />
                <Field label="Phone number" value={phoneNumber} onChange={setPhoneNumber} type="tel" />
                {status && <p className="rounded border border-accent-primary/40 bg-accent-primary/10 px-3 py-2 text-sm text-text-primary">{status}</p>}
                <div className="mt-2 flex flex-wrap gap-3">
                  <button disabled={saving} onClick={save} className="rounded-md bg-accent-primary px-6 py-3 text-sm font-black uppercase text-bg-primary disabled:opacity-60">{saving ? "Saving..." : "Save changes"}</button>
                  <button onClick={() => setEditing(false)} className="rounded-md border border-border-primary px-6 py-3 text-sm font-black uppercase">Cancel</button>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {status && !editing && (
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-5 right-5 z-[90] rounded-md border border-success/50 bg-bg-secondary px-4 py-3 text-sm font-semibold text-success shadow-tactical">
          {status}
        </motion.p>
      )}
    </main>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-3 bg-surface-card px-4 py-5">
      <Icon size={18} className="mt-0.5 shrink-0 text-accent-primary" />
      <div className="min-w-0">
        <p className="text-xs font-black uppercase text-text-secondary">{label}</p>
        <p className="mt-1 break-words font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, title, copy }: { href: string; icon: typeof Package; title: string; copy: string }) {
  return (
    <Link href={href} className="group flex items-center gap-4 rounded-md border border-border-primary bg-black/10 p-4 transition hover:-translate-y-0.5 hover:border-accent-primary hover:bg-surface-elevated">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-accent-primary/15 text-accent-primary"><Icon size={20} /></span>
      <span className="min-w-0">
        <span className="block text-sm font-black uppercase">{title}</span>
        <span className="mt-1 block text-xs text-text-secondary">{copy}</span>
      </span>
    </Link>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="block rounded-md border border-border-primary bg-black/15 px-4 py-3 focus-within:border-accent-primary">
      <span className="mb-2 block text-xs font-black uppercase text-text-secondary">{label}</span>
      <input type={type} className="w-full bg-transparent outline-none" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
