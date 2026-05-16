import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchAssignments,
  updateAssignmentStatusAsync,
  type AssignmentType,
  type AssignmentStatus,
} from "../redux/slices/assignmentsSlice";
import { ConfirmDelete } from "./shared/Modal";
import "../styles/styleAdminCatalog.css";

// ─── מיפויים ──────────────────────────────────────────────────────────────

const STATUS_TO_INT: Record<string, number> = {
  Active:   0,
  Finished: 1,
  Cancelled: 2,
};

// מה מותר לשנות מכל סטטוס
const ALLOWED_TRANSITIONS: Record<string, AssignmentStatus[]> = {
  Active:    ["Active", "Finished", "Cancelled"],
  Finished:  ["Finished"],   // נעול
  Cancelled: ["Cancelled"],  // נעול (לא אמור להיות בטבלה, כי נמחק)
};

const statusMeta: Record<string, { label: string; cls: string; emoji: string }> = {
  Active:    { label: "Active",    cls: "s-matched",   emoji: "🟡" },
  Finished:  { label: "Finished",  cls: "s-completed", emoji: "✅" },
  Cancelled: { label: "Cancelled", cls: "s-cancelled", emoji: "❌" },
};

// ─── StatusSelect ──────────────────────────────────────────────────────────

function AssignmentStatusSelect({
  assignment,
  onUpdate,
}: {
  assignment: AssignmentType;
  onUpdate: (id: number, newStatus: number) => Promise<void>;
}) {
  const current =
    typeof assignment.status === "number"
      ? (["Active", "Finished", "Cancelled"][assignment.status] as AssignmentStatus)
      : (assignment.status as AssignmentStatus);

  const [localVal, setLocalVal] = useState(current);
  const [busy, setBusy] = useState(false);

  useEffect(() => { setLocalVal(current); }, [current]);

  const allowed = ALLOWED_TRANSITIONS[localVal] ?? [localVal];
  const isLocked = allowed.length === 1;
  const meta = statusMeta[localVal] ?? { label: localVal, cls: "", emoji: "" };

  if (isLocked) {
    return <span className={`status-badge ${meta.cls}`}>{meta.emoji} {meta.label}</span>;
  }

  const handleChange = async (val: string) => {
    if (val === localVal) return;
    setBusy(true);
    try {
      await onUpdate(assignment.id, STATUS_TO_INT[val]);
      setLocalVal(val as AssignmentStatus);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Failed to update.";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <select
      className={`status-select ${meta.cls}`}
      value={localVal}
      disabled={busy}
      onChange={(e) => handleChange(e.target.value)}
    >
      {allowed.map((s) => (
        <option key={s} value={s}>
          {statusMeta[s].emoji} {statusMeta[s].label}
        </option>
      ))}
    </select>
  );
}

// ─── קומפוננטה ראשית ───────────────────────────────────────────────────────

export default function AssignmentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((s: RootState) => s.assignments);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | AssignmentStatus>("All");
  const [cancelTarget, setCancelTarget] = useState<AssignmentType | null>(null);

  useEffect(() => { dispatch(fetchAssignments()); }, [dispatch]);

  const filtered = items.filter((a) => {
    const status =
      typeof a.status === "number"
        ? ["Active", "Finished", "Cancelled"][a.status]
        : a.status;

    const matchStatus = filterStatus === "All" || status === filterStatus;
    const matchSearch =
      String(a.volunteerID).includes(search) ||
      String(a.helpRequestID).includes(search) ||
      (a.volunteerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (a.requesterName ?? "").toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const handleStatusUpdate = async (id: number, statusInt: number) => {
    if (statusInt === 2) {
      // Cancelled — מראה confirm קודם
      const target = items.find((a) => a.id === id);
      if (target) { setCancelTarget(target); return; }
    }
    await dispatch(updateAssignmentStatusAsync({ id, status: statusInt })).unwrap();
    dispatch(fetchAssignments()); // רענון
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    await dispatch(updateAssignmentStatusAsync({ id: cancelTarget.id, status: 2 })).unwrap();
    setCancelTarget(null);
    dispatch(fetchAssignments());
  };

  const counts = {
    all:      items.length,
    active:   items.filter((a) => a.status === "Active"   || a.status === 0).length,
    finished: items.filter((a) => a.status === "Finished" || a.status === 1).length,
  };

  return (
    <div className="list-root">

      {/* Header */}
      <div className="list-header">
        <div>
          <div className="list-eyebrow">Manage</div>
          <h1 className="list-title">Assignments</h1>
        </div>
        <button className="list-add-btn" onClick={() => dispatch(fetchAssignments())}>
          ↺ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="metrics-grid" style={{ marginBottom: 16 }}>
        <div className="metric-card">
          <div className="metric-label">Total</div>
          <div className="metric-value">{counts.all}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">🟡 Active</div>
          <div className="metric-value">{counts.active}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">✅ Finished</div>
          <div className="metric-value">{counts.finished}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="list-toolbar">
        <div className="list-search-wrap">
          <svg className="list-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input
            className="list-search"
            placeholder="Search by volunteer / needy / ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="field-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{ marginLeft: 8 }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">🟡 Active</option>
          <option value="Finished">✅ Finished</option>
        </select>

        <div className="list-count">{filtered.length} assignments</div>
      </div>

      {error && <div className="list-error">Error: {error}</div>}

      {/* Table */}
      <div className="list-table-wrap">
        {loading ? (
          <div className="list-loading"><div className="list-spinner" />Loading...</div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                {["ID", "Volunteer", "Needy / Request", "Description", "Assigned At", "Status"].map((h) => (
                  <th key={h} className="list-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="list-empty">No assignments found.</td></tr>
              ) : filtered.map((a) => (
                <tr key={a.id} className="list-row">
                  <td className="list-td">#{a.id}</td>
                  <td className="list-td">
                    <div className="list-name-cell">
                      <div className="list-avatar">{(a.volunteerName ?? "V")[0]}</div>
                      <div>
                        <div className="list-name">{a.volunteerName ?? `#${a.volunteerID}`}</div>
                      </div>
                    </div>
                  </td>
                  <td className="list-td list-td--muted">
                    <div>{a.requesterName ?? `Needy #${a.helpRequestID}`}</div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                      {a.requesterCity} · Request #{a.helpRequestID}
                    </div>
                  </td>
                  <td className="list-td list-td--muted">
                    {a.helpRequestTitle ?? "—"}
                  </td>
                  <td className="list-td list-td--muted">
                    {new Date(a.assignedAt).toLocaleDateString("he-IL")}
                  </td>
                  <td className="list-td">
                    <AssignmentStatusSelect
                      assignment={a}
                      onUpdate={handleStatusUpdate}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm Cancel */}
      {cancelTarget && (
        <ConfirmDelete
          label={`Assignment #${cancelTarget.id} (${cancelTarget.volunteerName ?? "volunteer"})`}
          onConfirm={confirmCancel}
          onCancel={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}