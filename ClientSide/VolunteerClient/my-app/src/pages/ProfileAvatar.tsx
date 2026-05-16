import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../redux/store';
import { updateUser } from '../redux/slices/authSlice';
import axios from '../services/axios';

interface EditForm {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  street: string;
}

const ProfileAvatar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const [open,    setOpen]    = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  const [form, setForm] = useState<EditForm>({
    fullName: user?.fullName ?? '',
    email:    user?.email    ?? '',
    phone:    user?.phone    ?? '',
    city:     user?.city     ?? '',
    street:   user?.street   ?? '',
  });

  // סגור dropdown בלחיצה מחוץ
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // סנכרן form עם user
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName ?? '',
        email:    user.email    ?? '',
        phone:    user.phone    ?? '',
        city:     user.city     ?? '',
        street:   user.street   ?? '',
      });
    }
  }, [user]);

  const initials = (user?.fullName ?? '?')
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    try {
      await axios.put(`/Users/${user.id}`, { ...user, ...form });
      dispatch(updateUser({ ...user, ...form })); // עדכן Redux
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pav-wrap" ref={ref}>

      {/* ── עיגול הפרופיל ── */}
      <button
        className={`pav-circle ${open ? 'pav-circle--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Profile menu"
      >
        {initials}
        <span className="pav-status-dot" />
      </button>

      {/* ── Toast קטן ── */}
      {saved && <div className="pav-saved">✓ Saved</div>}

      {/* ── Dropdown ── */}
      {open && (
        <div className="pav-dropdown">

          {!editing ? (
            /* ── מצב תצוגה ── */
            <>
              <div className="pav-dd-header">
                <div className="pav-dd-avatar">{initials}</div>
                <div>
                  <div className="pav-dd-name">{user?.fullName}</div>
                  <div className="pav-dd-email">{user?.email}</div>
                </div>
              </div>

              <div className="pav-dd-info">
                {user?.city && (
                  <div className="pav-dd-row">
                    <span className="pav-dd-row-icon">📍</span>
                    <span>{user.city}{user.street ? `, ${user.street}` : ''}</span>
                  </div>
                )}
                {user?.phone && (
                  <div className="pav-dd-row">
                    <span className="pav-dd-row-icon">📱</span>
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>

              <button className="pav-dd-edit-btn" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            </>
          ) : (
            /* ── מצב עריכה ── */
            <form className="pav-dd-form" onSubmit={handleSave}>
              <div className="pav-dd-form-title">Edit Profile</div>

              {[
                { key: 'fullName', label: 'Full Name',  type: 'text'  },
                { key: 'email',    label: 'Email',      type: 'email' },
                { key: 'phone',    label: 'Phone',      type: 'text'  },
                { key: 'city',     label: 'City',       type: 'text'  },
                { key: 'street',   label: 'Street',     type: 'text'  },
              ].map(({ key, label, type }) => (
                <div className="pav-dd-field" key={key}>
                  <label className="pav-dd-label">{label}</label>
                  <input
                    className="pav-dd-input"
                    type={type}
                    value={form[key as keyof EditForm]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    required={key === 'fullName' || key === 'email'}
                  />
                </div>
              ))}

              <div className="pav-dd-form-actions">
                <button
                  type="button"
                  className="pav-dd-cancel"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="pav-dd-save"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : '✓ Save'}
                </button>
              </div>
            </form>
          )}

        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
