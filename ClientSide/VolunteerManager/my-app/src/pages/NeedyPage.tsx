import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchNeedy,
  addNeedy,
  updateNeedy,
  deleteNeedy,
  type Needy,
} from "../redux/slices/needySlice";
import "../styles/styleNeedy.css";

type AddForm = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  street: string;
};

const EMPTY_ADD: AddForm = {
  fullName: "", email: "", password: "", phone: "", city: "",street:"",
};

type EditForm = Omit<Needy, "id">;

export default function NeedyPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((s: RootState) => s.needy);

  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Needy | null>(null);
  const [addForm, setAddForm]     = useState<AddForm>(EMPTY_ADD);
  const [editForm, setEditForm]   = useState<EditForm>({ fullName: "", email: "", phone: "", city: "",street:"", userRole: 1, rating: 0 });
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { dispatch(fetchNeedy()); }, [dispatch]);

  const filtered = list.filter((n) =>
    n.fullName.toLowerCase().includes(search.toLowerCase()) ||
    n.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setAddForm(EMPTY_ADD);
    setModalOpen(true);
  };

  const openEdit = (n: Needy) => {
    setEditing(n);
    setEditForm({ fullName: n.fullName, email: n.email, phone: n.phone, city: n.city, street: n.street, userRole: 1, rating: n.rating });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateNeedy({ id: editing.id, ...editForm })).unwrap();
      } else {
        await dispatch(addNeedy(addForm)).unwrap();
      }
      setModalOpen(false);
    } catch {
      alert("Failed to save, please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    try {
      await dispatch(deleteNeedy(deleteId)).unwrap();
    } catch {
      alert("שגיאה בDelete.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="list-root">
      <div className="list-header">
        <div>
          <div className="list-eyebrow">Management</div>
          <h1 className="list-title">Needy</h1>
        </div>
        <button className="list-add-btn" onClick={openAdd}>
          <span className="list-add-icon">+</span>
          Add Person
        </button>
      </div>

      <div className="list-toolbar">
        <div className="list-search-wrap">
          <svg className="list-search-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          <input className="list-search" placeholder="Search by name or email..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="list-count">{filtered.length} Needy</div>
      </div>

      {error && <div className="list-error">Error: {error}</div>}

      <div className="list-table-wrap">
        {loading ? (
          <div className="list-loading"><div className="list-spinner" />Loading...</div>
        ) : (
          <table className="list-table">
            <thead>
              <tr>
                {["Name", "Email", "Phone", "City", "Street", "Rating", "Actions"].map((h) => (
                  <th key={h} className="list-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="list-empty">לא נמצאו Needy</td></tr>
              ) : filtered.map((n) => (
                <tr key={n.id} className="list-row">
                  <td className="list-td">
                    <div className="list-name-cell">
                      <div className="list-avatar list-avatar--needy">{n.fullName[0]}</div>
                      <span className="list-name">{n.fullName}</span>
                    </div>
                  </td>
                  <td className="list-td list-td--muted">{n.email}</td>
                  <td className="list-td list-td--muted">{n.phone}</td>
                  <td className="list-td list-td--muted">{n.city}</td>
                  <td className="list-td list-td--muted">{n.street}</td>
                  <td className="list-td">
                    <span className="list-rating">{"★".repeat(Math.round(n.rating))}{"☆".repeat(5 - Math.round(n.rating))}</span>
                  </td>
                  <td className="list-td">
                    <div className="list-actions">
                      <button className="list-btn-edit" onClick={() => openEdit(n)}>Edit</button>
                      <button className="list-btn-delete" onClick={() => setDeleteId(n.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Person" : "Add Person"}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Full Name</label>
                <input className="modal-input" required
                  value={editing ? editForm.fullName : addForm.fullName}
                  onChange={(e) => editing
                    ? setEditForm((f) => ({ ...f, fullName: e.target.value }))
                    : setAddForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Email</label>
                <input className="modal-input" type="email" required
                  value={editing ? editForm.email : addForm.email}
                  onChange={(e) => editing
                    ? setEditForm((f) => ({ ...f, email: e.target.value }))
                    : setAddForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              {!editing && (
                <div className="modal-field">
                  <label className="modal-label">Password</label>
                  <input className="modal-input" type="password" required
                    value={addForm.password}
                    onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))} />
                </div>
              )}
              <div className="modal-field">
                <label className="modal-label">Phone</label>
                <input className="modal-input"
                  value={editing ? editForm.phone : addForm.phone}
                  onChange={(e) => editing
                    ? setEditForm((f) => ({ ...f, phone: e.target.value }))
                    : setAddForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">City</label>
                <input className="modal-input"
                  value={editing ? editForm.city : addForm.city}
                  onChange={(e) => editing
                    ? setEditForm((f) => ({ ...f, city: e.target.value }))
                    : setAddForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="modal-field">
                <label className="modal-label">Street</label>
                <input className="modal-input"
                  value={editing ? editForm.street : addForm.street}
                  onChange={(e) => editing
                    ? setEditForm((f) => ({ ...f, street: e.target.value }))
                    : setAddForm((f) => ({ ...f, street: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="modal-btn-submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Person"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h2 className="confirm-title">Delete Person</h2>
            <p className="confirm-desc">האם אתה בטוח? פעולה זו אינה ניתנת לCancel.</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="modal-btn-danger" onClick={handleDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
