import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
  fetchVolunteers,
  addVolunteer,
  updateVolunteer,
  deleteVolunteer,
  type Volunteer,
} from "../redux/slices/volunteerSlice";
import "../styles/styleVolunteer.css";

// טופס הוספה — שדות שה-Register מצפה לקבל
type AddForm = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  street: string;
};

const EMPTY_ADD: AddForm = {
  fullName: "", email: "", password: "", phone: "", city: "", street: "",
};

// טופס Edit — שדות של Volunteer קיים (ללא Password)
type EditForm = Omit<Volunteer, "id">;

export default function VolunteerPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { list, loading, error } = useSelector((s: RootState) => s.volunteers);

  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<Volunteer | null>(null);
  const [addForm, setAddForm]     = useState<AddForm>(EMPTY_ADD);
  const [editForm, setEditForm]   = useState<EditForm>({ fullName: "", email: "", phone: "", city: "", street: "", userRole: 0, rating: 0 });
  const [deleteId, setDeleteId]   = useState<number | null>(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { dispatch(fetchVolunteers()); }, [dispatch]);

  const filtered = list.filter((v) =>
    v.fullName.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setAddForm(EMPTY_ADD);
    setModalOpen(true);
  };

  const openEdit = (v: Volunteer) => {
    setEditing(v);
    setEditForm({ fullName: v.fullName, email: v.email, phone: v.phone, city: v.city, street: v.street, userRole: 0, rating: v.rating });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await dispatch(updateVolunteer({ id: editing.id, ...editForm })).unwrap();
      } else {
        await dispatch(addVolunteer(addForm)).unwrap();
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
      await dispatch(deleteVolunteer(deleteId)).unwrap();
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
          <h1 className="list-title">Volunteers</h1>
        </div>
        <button className="list-add-btn" onClick={openAdd}>
          <span className="list-add-icon">+</span>
          Add Volunteer
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
        <div className="list-count">{filtered.length} Volunteers</div>
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
                <tr><td colSpan={6} className="list-empty">לא נמצאו Volunteers</td></tr>
              ) : filtered.map((v) => (
                <tr key={v.id} className="list-row">
                  <td className="list-td">
                    <div className="list-name-cell">
                      <div className="list-avatar">{v.fullName[0]}</div>
                      <span className="list-name">{v.fullName}</span>
                    </div>
                  </td>
                  <td className="list-td list-td--muted">{v.email}</td>
                  <td className="list-td list-td--muted">{v.phone}</td>
                  <td className="list-td list-td--muted">{v.city}</td>
                  <td className="list-td list-td--muted">{v.street}</td>
                  <td className="list-td">
                    <span className="list-rating">{"★".repeat(Math.round(v.rating))}{"☆".repeat(5 - Math.round(v.rating))}</span>
                  </td>
                  <td className="list-td">
                    <div className="list-actions">
                      <button className="list-btn-edit" onClick={() => openEdit(v)}>Edit</button>
                      <button className="list-btn-delete" onClick={() => setDeleteId(v.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal הוספה / Edit */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editing ? "Edit Volunteer" : "Add Volunteer"}</h2>
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
              {/* Password רק בהוספה */}
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
                  {saving ? "Saving..." : editing ? "Save Changes" : "Add Volunteer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* אישור Delete */}
      {deleteId !== null && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h2 className="confirm-title">Delete Volunteer</h2>
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
