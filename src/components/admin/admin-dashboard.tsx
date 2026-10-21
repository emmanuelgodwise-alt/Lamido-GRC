"use client";

/**
 * Protected admin dashboard — Stage 5.
 *
 * State machine: checking → (login | denied | ready). Supabase Auth handles
 * sessions; database RLS is the real security boundary (every query fails
 * closed for non-admins). On sign-out or expiry all private UI state is
 * cleared. Nothing private ever appears in URLs or analytics; the service
 * worker never caches /admin.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { AlertTriangle, Loader2, Lock, LogOut, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { btn, card, container } from "@/lib/styles";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  checkAdmin,
  fetchCounts,
  fetchDetail,
  fetchForExport,
  fetchPage,
  updateNotes,
  updateStatus,
  type EnquiryEventRecord,
  type EnquiryRecord,
  type StatusFilter,
} from "@/lib/admin/queries";
import { ENQUIRY_STATUSES, statusLabels, type EnquiryStatus } from "@/lib/admin/status";
import { buildCsv, csvFilename, downloadCsv } from "@/lib/admin/csv";
import { LoginPanel } from "@/components/admin/login-panel";
import { EnquiryList } from "@/components/admin/enquiry-list";
import { EnquiryDetail } from "@/components/admin/enquiry-detail";

type View = "checking" | "login" | "denied" | "ready";

export function AdminDashboard() {
  const configured = isSupabaseConfigured();
  const db = configured ? getSupabaseBrowserClient() : null;
  const [view, setView] = useState<View>("checking");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  // Dashboard data (kept in one place so sign-out can clear everything).
  const [counts, setCounts] = useState<Record<EnquiryStatus, number> | null>(null);
  const [rows, setRows] = useState<EnquiryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EnquiryRecord | null>(null);
  const [events, setEvents] = useState<EnquiryEventRecord[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [exporting, setExporting] = useState(false);
  const selectedRef = useRef<string | null>(null);

  // -------------------------------------------------------------------
  // Auth state machine
  // -------------------------------------------------------------------
  const clearPrivateState = useCallback(() => {
    setCounts(null);
    setRows([]);
    setTotal(0);
    setPage(0);
    setStatusFilter("all");
    setSearch("");
    setSelected(null);
    setEvents([]);
    selectedRef.current = null;
    setListError(null);
  }, []);

  const evaluateSession = useCallback(
    async (session: Session | null) => {
      if (!db) return;
      if (!session) {
        clearPrivateState();
        setSessionEmail(null);
        setView("login");
        return;
      }
      setSessionEmail(session.user.email ?? null);
      const admin = await checkAdmin(db);
      setView(admin ? "ready" : "denied");
      if (!admin) clearPrivateState();
    },
    [db, clearPrivateState],
  );

  useEffect(() => {
    if (!db) {
      setView("checking");
      return;
    }
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const { data } = await db.auth.getSession();
      if (!mounted) return;
      await evaluateSession(data.session);

      const { data: listener } = db.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") {
          setExpired(true);
          clearPrivateState();
          setSessionEmail(null);
          setView("login");
        } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          setExpired(false);
          evaluateSession(session);
        }
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    })();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [db, evaluateSession, clearPrivateState]);

  // -------------------------------------------------------------------
  // Data loading (ready view only — every query is RLS-guarded)
  // -------------------------------------------------------------------
  const loadList = useCallback(
    async (nextPage: number, nextStatus: StatusFilter, nextSearch: string) => {
      if (!db) return;
      setLoadingList(true);
      setListError(null);
      try {
        const [pageData, nextCounts] = await Promise.all([
          fetchPage(db, nextStatus, nextSearch, nextPage),
          fetchCounts(db),
        ]);
        setRows(pageData.rows);
        setTotal(pageData.total);
        setCounts(nextCounts);
      } catch {
        setListError(
          "Enquiries could not be loaded. This can happen when the session has expired or the connection dropped — use Refresh or sign in again.",
        );
      } finally {
        setLoadingList(false);
      }
    },
    [db],
  );

  useEffect(() => {
    if (view !== "ready") return;
    const timer = setTimeout(() => {
      loadList(page, statusFilter, search);
    }, 300); // debounce the search input
    return () => clearTimeout(timer);
  }, [view, page, statusFilter, search, loadList]);

  const openDetail = useCallback(
    async (id: string) => {
      if (!db) return;
      setLoadingList(true);
      try {
        const detail = await fetchDetail(db, id);
        if (detail) {
          setSelected(detail.enquiry);
          setEvents(detail.events);
          selectedRef.current = detail.enquiry.id;
        }
      } finally {
        setLoadingList(false);
      }
    },
    [db],
  );

  const changeStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      if (!db) return;
      await updateStatus(db, id, status);
      await loadList(page, statusFilter, search);
      if (selectedRef.current === id) await openDetail(id);
    },
    [db, page, statusFilter, search, loadList, openDetail],
  );

  const saveNotes = useCallback(
    async (id: string, notes: string) => {
      if (!db) return;
      await updateNotes(db, id, notes);
      if (selectedRef.current === id) await openDetail(id);
    },
    [db, openDetail],
  );

  const exportCsv = useCallback(async () => {
    if (!db || exporting) return;
    setExporting(true);
    try {
      const exportRows = await fetchForExport(db, statusFilter, search);
      const csv = buildCsv(exportRows, [
        { header: "Reference", value: (row) => row.reference_id },
        { header: "Submitted (UTC)", value: (row) => row.submitted_at },
        { header: "Status", value: (row) => statusLabels[row.status] },
        { header: "Name", value: (row) => row.name },
        { header: "Email", value: (row) => row.email },
        { header: "Organization", value: (row) => row.organization },
        { header: "Role", value: (row) => row.role },
        { header: "Country", value: (row) => row.country },
        { header: "Region", value: (row) => row.region },
        { header: "Sector", value: (row) => row.sector },
        { header: "Division", value: (row) => row.division },
        { header: "Subject", value: (row) => row.subject },
        { header: "Message", value: (row) => row.message },
        { header: "Updated (UTC)", value: (row) => row.updated_at },
      ]);
      downloadCsv(csv, csvFilename());
    } catch {
      setListError("The CSV export could not be produced — please try again.");
    } finally {
      setExporting(false);
    }
  }, [db, exporting, statusFilter, search]);

  const signOut = useCallback(async () => {
    if (!db) return;
    await db.auth.signOut();
    clearPrivateState();
    setSessionEmail(null);
    setView("login");
  }, [db, clearPrivateState]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  if (!configured || !db) {
    return (
      <Section>
        <div className={cn(card, "mx-auto max-w-md p-6 text-center")}>
          <AlertTriangle className="mx-auto h-8 w-8 text-gold" aria-hidden />
          <h1 className="mt-3 font-display text-lg font-semibold text-navy">
            Administration area unavailable
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            The secure enquiry system is not yet connected. The administrator
            dashboard becomes available once the company&apos;s backend is
            configured (see the setup documentation).
          </p>
        </div>
      </Section>
    );
  }

  if (view === "checking") {
    return (
      <Section>
        <div className="flex flex-col items-center gap-3 py-16 text-ink/60">
          <Loader2 className="h-7 w-7 animate-spin text-navy" aria-hidden />
          <p className="text-sm">Checking your session…</p>
        </div>
      </Section>
    );
  }

  if (view === "login") {
    return (
      <Section>
        {expired && (
          <p
            role="status"
            className="mx-auto mb-4 max-w-md rounded-lg border border-gold/40 bg-gold/[0.08] p-3 text-center text-sm text-ink/80"
          >
            Your session has expired — please sign in again.
          </p>
        )}
        <LoginPanel
          onSignIn={async (email, password) => {
            const { error } = await db.auth.signInWithPassword({ email, password });
            if (error) {
              return "Sign-in failed — check the email and password, then try again.";
            }
            return null;
          }}
          onRecovery={async (email) => {
            const { error } = await db.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/admin`,
            });
            if (error) {
              return "A reset email could not be sent just now — please try again later.";
            }
            return null;
          }}
        />
      </Section>
    );
  }

  if (view === "denied") {
    return (
      <Section>
        <div className={cn(card, "mx-auto max-w-md p-6 text-center")}>
          <Lock className="mx-auto h-8 w-8 text-gold" aria-hidden />
          <h1 className="mt-3 font-display text-lg font-semibold text-navy">
            Not an administrator
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            {sessionEmail
              ? `The account ${sessionEmail} is signed in, but it is not authorized as a Lamido, Lamido & Co. administrator. If you believe this is wrong, ask the owner to add your account through the documented process.`
              : "This account is not authorized as an administrator."}
          </p>
          <button type="button" onClick={signOut} className={cn(btn("outline"), "mt-5")}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </Section>
    );
  }

  // view === "ready"
  return (
    <Section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
            Internal
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-navy sm:text-3xl">
            Enquiry dashboard
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Signed in as <span className="font-medium text-ink/80">{sessionEmail}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadList(page, statusFilter, search)}
            className={btn("outline", "px-4 py-2.5")}
            disabled={loadingList}
          >
            <RefreshCw className={cn("h-4 w-4", loadingList && "animate-spin")} aria-hidden />
            Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className={btn("primary", "px-4 py-2.5")}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
          <button type="button" onClick={signOut} className={btn("outline", "px-4 py-2.5")}>
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      </div>

      {counts && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ENQUIRY_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setPage(0);
                setStatusFilter(statusFilter === status ? "all" : status);
              }}
              aria-pressed={statusFilter === status}
              className={cn(
                card,
                "p-4 text-left transition-colors hover:border-gold/60",
                statusFilter === status && "border-gold/70 bg-gold/[0.05]",
              )}
            >
              <span className="text-2xl font-semibold text-navy">
                {counts[status]}
              </span>
              <span className="mt-0.5 block text-xs font-medium uppercase tracking-wide text-ink/55">
                {statusLabels[status]}
              </span>
            </button>
          ))}
        </div>
      )}

      {listError && (
        <p
          role="alert"
          className="mt-5 rounded-lg border border-destructive/40 bg-destructive/[0.06] p-4 text-sm text-ink/80"
        >
          {listError}
        </p>
      )}

      {selected ? (
        <EnquiryDetail
          enquiry={selected}
          events={events}
          onClose={() => {
            setSelected(null);
            setEvents([]);
            selectedRef.current = null;
          }}
          onStatusChange={changeStatus}
          onNotesSave={saveNotes}
        />
      ) : (
        <EnquiryList
          rows={rows}
          total={total}
          page={page}
          pageSize={10}
          statusFilter={statusFilter}
          search={search}
          loading={loadingList}
          onPageChange={setPage}
          onStatusFilterChange={(value) => {
            setPage(0);
            setStatusFilter(value);
          }}
          onSearchChange={(value) => {
            setPage(0);
            setSearch(value);
          }}
          onOpen={openDetail}
        />
      )}
    </Section>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(container, "flex-1 py-10 sm:py-14")}>
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </div>
  );
}
