import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchHelpRequests,
  updateRequestAsync,
  deleteRequestAsync,
} from "../redux/slices/helpRequestsSlice";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import { runMatching, clearResults, type MatchResult } from "../redux/slices/matchingSlice";

import type { HelpRequestType, HelpRequestStatus } from "../redux/slices/helpRequestsSlice";
import type { CategoryType } from "../redux/slices/categoriesSlice";

import { ConfirmDelete } from "./shared/Modal";
import "../styles/styleAdminCatalog.css";
import "../styles/styleMatching.css";

// ─── מיפויים ──────────────────────────────────────────────────────────────

const STATUS_MAP: Record<number, HelpRequestStatus> = {
  0: "Open",
  1: "Matched",
  2: "Completed",
  3: "Cancelled",
};

const statusMeta: Record<HelpRequestStatus, { label: string; cls: string; emoji: string }> = {
  Open:      { label: "Open",      cls: "s-open",      emoji: "🔵" },
  Matched:   { label: "Matched",   cls: "s-matched",   emoji: "🟡" },
  Completed: { label: "Completed", cls: "s-completed", emoji: "✅" },
  Cancelled: { label: "Cancelled", cls: "s-cancelled", emoji: "❌" },
};

const emptyForm = (base: HelpRequestType): Omit<HelpRequestType, "id"> => ({ ...base });

// ─── תצוגת סטטוס ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: HelpRequestStatus | number }) {
  const name: HelpRequestStatus =
    typeof status === "number" ? STATUS_MAP[status] : status;
  const meta = statusMeta[name] ?? { label: String(name), cls: "", emoji: "" };
  return (
    <span className={`status-badge ${meta.cls}`}>
      {meta.emoji} {meta.label}
    </span>
  );
}

// ─── Form + MatchCard ──────────────────────────────────────────────────────

function RequestForm({
  form, categories, onChange,
}: {
  form: Omit<HelpRequestType, "id">;
  categories: CategoryType[];
  onChange: (f: typeof form) => void;
}) {
  return (
    <div className="form-fields">
      <div className="form-row-2">
        <div>
          <label className="field-label">Needy ID</label>
          <input className="field-input" type="number" value={form.needyID || ""} disabled />
        </div>
        <div>
          <label className="field-label">Category *</label>
          <select className="field-select" value={form.categoryID}
            onChange={(e) => onChange({ ...form, categoryID: Number(e.target.value) })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <label className="field-label">Description *</label>
      <textarea className="field-textarea" rows={4} value={form.description}
        onChange={(e) => onChange({ ...form, description: e.target.value })} />
    </div>
  );
}

function MatchCard({ m }: { m: MatchResult }) {
  return (
    <div className="match-card">
      <div className="match-card-top">
        <span className="match-category">{m.categoryName}</span>
        <span className="match-score">Score {(m.score * 100).toFixed(0)}%</span>
      </div>
      <div className="match-row">
        <div className="match-side match-side--needy">
          <div className="match-role-label">🙏 Needy</div>
          <div className="match-name">{m.needyName}</div>
          <div className="match-id">#{m.needyId} · Request #{m.helpRequestId}</div>
        </div>
        <div className="match-arrow">⟷</div>
        <div className="match-side match-side--volunteer">
          <div className="match-role-label">🤲 Volunteer</div>
          <div className="match-name">{m.volunteerName}</div>
          <div className="match-id">#{m.volunteerId}</div>
        </div>
      </div>
      <div className="match-meta">
        <span>📅 {m.matchedDay}</span>
        <span>🕐 {m.timeFrom} – {m.timeTo}</span>
        <span>📍 {m.distanceKm} km</span>
      </div>
    </div>
  );
}

// ─── קומפוננטה ראשית ───────────────────────────────────────────────────────

export default function HelpRequestsPanel() {
  const dispatch   = useDispatch<AppDispatch>();
  const items      = useSelector((state: RootState) => state.helpRequests.items);
  const reqStatus  = useSelector((state: RootState) => state.helpRequests.status);
  const categories = useSelector((state: RootState) => state.categories.items);

  const { results: matchResults, loading: matchLoading, error: matchError, lastRun } =
    useSelector((state: RootState) => state.matching);

  const [view,         setView]         = useState<"list" | "edit">("list");
  const [selected,     setSelected]     = useState<HelpRequestType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HelpRequestType | null>(null);
  const [form,         setForm]         = useState<Omit<HelpRequestType, "id"> | null>(null);
  const [showMatches,  setShowMatches]  = useState(false);

  useEffect(() => {
    if (reqStatus === "idle") dispatch(fetchHelpRequests());
    if (categories.length === 0) dispatch(fetchCategories());
  }, [reqStatus, categories.length, dispatch]);

  const getCategory = (id: number) => categories.find((c) => c.id === id);

  const handleRunMatching = async () => {
    dispatch(clearResults());
    await dispatch(runMatching());
    dispatch(fetchHelpRequests());
    setShowMatches(true);
  };

  if (view === "list") {
    return (
      <>
        <div className="top-bar">
          <div>
            <div className="page-eyebrow">Manage</div>
            <h1 className="page-title">Help Requests</h1>
            {lastRun && <p className="panel-sub">Last matching run: {lastRun}</p>}
          </div>
          <div className="panel-actions">
            <button className="btn-match" onClick={handleRunMatching} disabled={matchLoading}>
              {matchLoading ? <><span className="match-spinner" /> Running…</> : "⚡ Run Matching"}
            </button>
          </div>
        </div>

        {matchError && <div className="match-error-banner">⚠ Matching error: {matchError}</div>}

        {showMatches && matchResults.length > 0 && (
          <div className="match-results-section">
            <div className="match-results-header">
              <h2 className="match-results-title">
                ✅ {matchResults.length} Match{matchResults.length > 1 ? "es" : ""} Created
              </h2>
              <button className="btn-ghost" onClick={() => setShowMatches(false)}>Hide</button>
            </div>
            <div className="match-cards-grid">
              {matchResults.map((m) => <MatchCard key={m.helpRequestId} m={m} />)}
            </div>
          </div>
        )}

        <div className="section">
          <table className="req-table">
            <thead>
              <tr>
                <th>ID</th><th>Needy</th><th>Category</th><th>Description</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const cat = getCategory(r.categoryID);
                return (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>#{r.needyID}</td>
                    <td>{cat?.icon} {cat?.name}</td>
                    <td>{r.description}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <button className="btn-icon"
                        onClick={() => { setSelected(r); setForm(emptyForm(r)); setView("edit"); }}>
                        ✏️
                      </button>
                      <button className="btn-icon" onClick={() => setDeleteTarget(r)}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {deleteTarget && (
          <ConfirmDelete
            label={`Request #${deleteTarget.id}`}
            onConfirm={() => { dispatch(deleteRequestAsync(deleteTarget.id)); setDeleteTarget(null); }}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </>
    );
  }

  // Edit only
  const STATUS_TO_INT: Record<string, number> = { Open: 0, Matched: 1, Completed: 2, Cancelled: 3 };
  return (
    <div className="section">
      <h2>Edit Request #{selected?.id}</h2>
      {form && (
        <RequestForm form={form} categories={categories} onChange={setForm} />
      )}
      <div className="form-actions">
        <button className="btn-save" onClick={() => {
          if (!form || !selected) return;
          const statusInt = typeof form.status === "string" ? STATUS_TO_INT[form.status] : form.status;
          dispatch(updateRequestAsync({ ...selected, ...form, status: statusInt as any }));
          setView("list");
        }}>Save</button>
        <button className="btn-cancel" onClick={() => setView("list")}>Cancel</button>
      </div>
    </div>
  );
}