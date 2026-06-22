"use client";

import Script from "next/script";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Gift, ShieldCheck, Sparkles, X } from "lucide-react";
import { getCart, getMe, googleLogin, logoutAccount, mergeCart, replaceCart, updateProfile, type UserAccount } from "@/lib/auth-api";
import { useCart } from "@/store/cart";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: { client_id: string; callback: (response: { credential: string }) => void }) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

type AuthContextValue = {
  user: UserAccount | null;
  loading: boolean;
  openLogin: () => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const { items, setItems, clear } = useCart();

  async function refreshUser() {
    const account = await getMe();
    setUser(account);
    if (account) {
      const serverItems = await getCart().catch(() => null);
      if (serverItems) setItems(serverItems);
    }
    setLoading(false);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      replaceCart(items).catch(() => undefined);
    }, 500);
    return () => window.clearTimeout(timer);
  }, [items, user]);

  useEffect(() => {
    if (user && !user.profile_complete) setProfileOpen(true);
  }, [user]);

  async function handleGoogleCredential(credential: string) {
    try {
      const account = await googleLogin(credential);
      setUser(account);
      setLoginOpen(false);
      if (items.length > 0) {
        const merged = await mergeCart(items);
        setItems(merged);
      }
      if (!account.profile_complete) setProfileOpen(true);
      setToast("Signed in successfully");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Google sign-in failed");
    }
  }

  async function logout() {
    await logoutAccount();
    setUser(null);
    clear();
    setToast("Logged out");
  }

  const value = useMemo(
    () => ({ user, loading, openLogin: () => setLoginOpen(true), logout, refreshUser }),
    [user, loading, items]
  );

  return (
    <AuthContext.Provider value={value}>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      {children}
      {loginOpen && (
        <LoginModal
          onClose={() => setLoginOpen(false)}
          onCredential={handleGoogleCredential}
          onError={(message) => setToast(message)}
        />
      )}
      {profileOpen && user && (
        <CompleteProfileModal
          user={user}
          onLogout={logout}
          onSaved={(account) => {
            setUser(account);
            setProfileOpen(false);
            setToast("Profile saved");
          }}
          onError={(message) => setToast(message)}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[120] max-w-sm border border-accent-primary bg-bg-primary px-4 py-3 text-sm font-semibold shadow-glow">
          <button className="absolute right-2 top-2 text-text-secondary" onClick={() => setToast("")} aria-label="Close notification">
            <X size={14} />
          </button>
          <span className="pr-5">{toast}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
}

function LoginModal({
  onClose,
  onCredential,
  onError,
}: {
  onClose: () => void;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const target = document.getElementById("google-login-button");
    if (!target || !clientId) return;
    const render = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onCredential(response.credential),
      });
      target.innerHTML = "";
      window.google.accounts.id.renderButton(target, {
        theme: "filled_black",
        size: "large",
        width: 280,
        text: "continue_with",
      });
    };
    const timer = window.setInterval(() => {
      if (window.google) {
        window.clearInterval(timer);
        render();
      }
    }, 100);
    render();
    return () => window.clearInterval(timer);
  }, [clientId, onCredential]);

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 px-3 py-6 backdrop-blur-sm">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border-primary bg-bg-primary shadow-2xl md:min-h-[560px] md:grid-cols-[1fr_1.05fr]">
        <ModalBrandPanel title="Welcome back" subtitle="Login to save your cart, profile, and orders in one place." />
        <div className="relative grid place-items-center bg-[#f7f5ef] px-5 py-10 text-[#12110f] md:px-10">
          <button onClick={onClose} className="absolute right-5 top-5 p-2 text-[#27231d] hover:text-accent-primary" aria-label="Close login">
            <X />
          </button>
          <div className="w-full max-w-md">
            <p className="text-sm font-black uppercase tracking-[.18em] text-accent-hover">OUTRAN account</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Login with Google</h2>
            <p className="mt-3 text-sm leading-6 text-[#5d5a52]">
              Continue with your Google account. We will ask for your name and phone number after login if your profile is incomplete.
            </p>
            <div className="mt-8 rounded-md border border-[#ded9cc] bg-white p-5 shadow-sm">
              {clientId ? (
                <div id="google-login-button" className="grid min-h-11 place-items-center" />
              ) : (
                <button
                  className="w-full rounded-md bg-black px-4 py-4 text-sm font-black uppercase text-white"
                  onClick={() => onError("Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env")}
                >
                  Continue with Google
                </button>
              )}
              <p className="mt-4 text-center text-xs font-semibold text-[#777164]">Secure login. No password needed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteProfileModal({
  user,
  onSaved,
  onLogout,
  onError,
}: {
  user: UserAccount;
  onSaved: (user: UserAccount) => void;
  onLogout: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(user.name ?? "");
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number ?? "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return onError("Name cannot be empty");
    if (!phoneNumber.trim()) return onError("Phone number is required");
    setSaving(true);
    try {
      onSaved(await updateProfile({ name: name.trim(), phone_number: phoneNumber.trim() }));
    } catch (error) {
      onError(error instanceof Error ? error.message : "Profile could not be saved");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 px-3 py-6 backdrop-blur-sm">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-border-primary bg-bg-primary shadow-2xl md:min-h-[560px] md:grid-cols-[1fr_1.05fr]">
        <ModalBrandPanel title="Almost done" subtitle="Your phone number and name are compulsory before checkout and account access." />
        <div className="relative grid place-items-center bg-[#f7f5ef] px-5 py-10 text-[#12110f] md:px-10">
          <div className="w-full max-w-md">
            <p className="text-sm font-black uppercase tracking-[.18em] text-accent-hover">Complete profile</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Add required details</h2>
            <p className="mt-3 text-sm leading-6 text-[#5d5a52]">
              Name and phone number are mandatory. The same phone number cannot be reused by another account.
            </p>
            <div className="mt-8 grid gap-4">
              <label className="block rounded-md border border-[#ded9cc] bg-white px-4 py-3 shadow-sm">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#777164]">Name</span>
                <input
                  className="w-full bg-transparent text-base font-semibold outline-none"
                  value={name}
                  required
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="block rounded-md border border-[#ded9cc] bg-white px-4 py-3 shadow-sm">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[.1em] text-[#777164]">Phone Number</span>
                <input
                  className="w-full bg-transparent text-base font-semibold outline-none"
                  value={phoneNumber}
                  required
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  onChange={(event) => setPhoneNumber(event.target.value)}
                />
              </label>
              <button disabled={saving} onClick={save} className="rounded-md bg-black px-5 py-4 text-sm font-black uppercase text-white disabled:opacity-60">
                {saving ? "Saving..." : "Save and continue"}
              </button>
              <button onClick={onLogout} className="text-sm font-bold text-[#777164] underline underline-offset-4">
                Logout instead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalBrandPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="hidden bg-black px-8 py-10 text-white md:block">
      <div className="flex items-center gap-4">
        <div className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-white/15 bg-white">
          <img src="/assets/outran-logo.svg" alt="OUTRAN" className="h-9 w-11 object-contain" />
        </div>
        <p className="text-lg font-black">OUTRAN</p>
      </div>
      <h2 className="mt-14 max-w-sm text-4xl font-black leading-tight tracking-tight">{title}</h2>
      <p className="mt-3 max-w-sm text-base leading-7 text-white/70">{subtitle}</p>
      <div className="mt-12 grid gap-8">
        <ModalBenefit icon={Gift} title="Your cart stays saved" copy="Login once and keep your selected tank cover variants ready." />
        <ModalBenefit icon={Sparkles} title="Faster checkout" copy="Profile details help us prefill shipping and order updates." />
        <ModalBenefit icon={ShieldCheck} title="Secure account" copy="Google login plus verified account details keep orders tied to you." />
      </div>
    </div>
  );
}

function ModalBenefit({ icon: Icon, title, copy }: { icon: typeof Gift; title: string; copy: string }) {
  return (
    <div className="flex gap-5">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white text-black">
        <Icon size={24} />
      </div>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/70">{copy}</p>
      </div>
    </div>
  );
}
