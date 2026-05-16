
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { Day } from '../../types/enums.types';
import type { AvailabilityType } from '../../types/availabilities.types';
import '../../styles/styleSchedule.css';
import axios from '../../services/axios';
import type { RootState, AppDispatch } from '../../redux/store';
import { setSlots } from '../../redux/slices/volunteerSlice';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const fmtTime = (t: string) => t.slice(0, 5);

const getWeekDates = () => {
  const today = new Date();
  const sun = new Date(today);
  sun.setDate(today.getDate() - today.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d;
  });
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const weekLabel = (dates: Date[]) =>
  `${MONTHS[dates[0].getMonth()].toUpperCase()} ${dates[0].getDate()}–${dates[6].getDate()}`;

const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));

// ... (שאר ה-imports נשארים אותו דבר)

export const SchedulePage = () => {
  useDocumentTitle('Schedule');
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const slots = useSelector((state: RootState) => state.volunteer.slots);

  const today = new Date();
  const weekDates = getWeekDates();

  const [modal, setModal] = useState<{ day: Day } | null>(null);
  const [form, setForm] = useState({ from: '09', to: '11' });
  const [overlapError, setOverlapError] = useState(false);

  // ── טעינת זמינות מהשרת
  useEffect(() => {
    if (!user) {
      dispatch(setSlots([]));
      return;
    }

    const fetchSlots = async () => {
      try {
        // וודא שהנתיב הזה באמת מחזיר את רשימת האובייקטים המלאה
        const res = await axios.get<AvailabilityType[]>(`/Availabilities/user/${user.id}`);
        console.log("Fetched slots:", res.data); // בדיקה בלוג שבאמת חוזר מידע
        dispatch(setSlots(res.data));
      } catch (err) {
        console.error('Failed to fetch availabilities:', err);
        dispatch(setSlots([]));
      }
    };

    fetchSlots();
  }, [user, dispatch]);

  // ── הוספת סלוט חדש
  const addSlot = async () => {
    if (!modal || !user) return;
    const from = Number(form.from);
    const to = Number(form.to);
    if (to <= from) return;

    // בדיקת חפיפה מקומית
    const daySlots = slots.filter(s => s.day === modal.day);
    const overlap = daySlots.some(s => {
      const sFrom = Number(s.from_Time.slice(0, 2));
      const sTo = Number(s.to_Time.slice(0, 2));
      return from < sTo && to > sFrom;
    });

    if (overlap) {
      setOverlapError(true);
      setTimeout(() => setOverlapError(false), 3000);
      return;
    }

    const newSlotPayload = {
      UserID: user.id, // חשוב מאוד לשלוח את זה כדי שהשליפה תעבוד בריענון עמוד
      Day: modal.day,
      From_Time: `${form.from}:00:00`,
      To_Time: `${form.to}:00:00`
    };

    try {
      // 1. יצירת הזמינות בטבלת הזמינויות
      const res = await axios.post('/Availabilities', newSlotPayload);
      const savedSlot = res.data;

      // 2. קישור למשתמש (לפי הלוגיקה החדשה שלך)
      await axios.post(`/Users/${user.id}/availability/${savedSlot.id}`);

      // 3. עדכון ה-State ב-Redux עם האובייקט שחזר מהשרת (כולל ה-ID החדש)
      dispatch(setSlots([...slots, savedSlot]));
      
      setModal(null); // סגירת המודאל רק בהצלחה
    } catch (err) {
      console.error('Failed to save availability:', err);
      alert('שגיאה בשמירת הזמינות. נסה שוב.');
    }
  };

  // ── מחיקת סלוט
  const removeSlot = async (slotId: number) => { // שים לב: מקבל ID ולא אינדקס
  if (!user) return;
  
  try {
    // 1. מחיקה מהשרת
    await axios.delete(`/Availabilities/${slotId}`);
    await axios.delete(`/Users/${user.id}/availability/${slotId}`);
    
    // 2. עדכון ה-Redux בצורה בטוחה (סינון לפי ID)
    const updatedSlots = slots.filter(s => s.id !== slotId);
    dispatch(setSlots(updatedSlots));
    
  } catch (err) {
    console.error('Failed to delete availability:', err);
    alert('שגיאה במחיקת הזמינות');
  }
};

  

  return (
    <div className="sch-root">
      {/* Header */}
      <div className="sch-header">
        <div>
          <div className="sch-week-label">WEEK OF {weekLabel(weekDates)}</div>
          <h1 className="sch-title">My Schedule</h1>
        </div>
        <button
          className="sch-add-btn"
          onClick={() => setModal({ day: today.getDay() as Day })}
        >
          + Add Availability
        </button>
      </div>

      {/* Grid */}
      <div className="sch-grid">
        {weekDates.map((date, idx) => {
          const dayEnum = idx as Day;
          const isToday = date.toDateString() === today.toDateString();
          const daySlots = slots.filter(s => s.day === dayEnum);

          return (
            <div key={idx} className={`sch-col ${isToday ? 'sch-col-today' : ''}`}>
              <div className="sch-day-head">
                <span className="sch-day-name">{DAY_LABELS[idx]}</span>
                <span className={`sch-day-num ${isToday ? 'sch-today-num' : ''}`}>
                  {date.getDate()}
                </span>
              </div>

              <div className="sch-slots">
                {daySlots.map((slot, slotIdx) => {
                  const globalIdx = slots.indexOf(slot);
                  return (
                    <div key={slotIdx} className="sch-slot sch-slot-free">
                      <span className="sch-slot-time">
                        {fmtTime(slot.from_Time)}–{fmtTime(slot.to_Time)}
                      </span>
                    <button
  className="sch-slot-del"
  onClick={() => slot.id !== undefined && removeSlot(slot.id)} // שלח את ה-ID של הסלוט
>
  ×
</button>
                    </div>
                  );
                })}

                <button
                  className="sch-slot-add"
                  onClick={() => setModal({ day: dayEnum })}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="sch-overlay" onClick={() => setModal(null)}>
          <div className="sch-modal" onClick={e => e.stopPropagation()}>
            <h3 className="sch-modal-title">
              Add Availability — {Day[modal.day]}, {weekDates[modal.day].getDate()}
            </h3>

            <div className="sch-modal-row">
              <div className="sch-modal-f">
                <label className="sch-modal-lbl">From</label>
                <select
                  className="sch-modal-sel"
                  value={form.from}
                  onChange={e => setForm(p => ({ ...p, from: e.target.value }))}
                >
                  {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
              <span className="sch-modal-sep">→</span>
              <div className="sch-modal-f">
                <label className="sch-modal-lbl">To</label>
                <select
                  className="sch-modal-sel"
                  value={form.to}
                  onChange={e => setForm(p => ({ ...p, to: e.target.value }))}
                >
                  {HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}
                </select>
              </div>
            </div>

            {overlapError && (
              <div className="sch-overlap-err">
                <span className="sch-overlap-icon">⚠</span>
                Time slot overlaps with an existing availability
              </div>
            )}

            <div className="sch-modal-actions">
              <button className="sch-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="sch-modal-confirm" onClick={addSlot}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};






