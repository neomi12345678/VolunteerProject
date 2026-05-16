// pages/NewRequestPage.tsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import type { RootState } from "../../redux/store";
import { addRequestSuccess } from "../../redux/slices/helpRequestsSlice";
import axios from "../../services/axios";
import "../../styles/styleNewRequest.css";

import type { HelpRequestType } from "../../types/helpRequests.types";
import type { AvailabilityType } from "../../types/availabilities.types";
import { Day } from "../../types/enums.types";

const MAX = 500;

/* ימי השבוע בסדר — קצר + ערך enum */
const DAYS: { label: string; short: string; value: Day }[] = [
  { label: "Sunday",    short: "Sun", value: Day.Sunday },
  { label: "Monday",    short: "Mon", value: Day.Monday },
  { label: "Tuesday",   short: "Tue", value: Day.Tuesday },
  { label: "Wednesday", short: "Wed", value: Day.Wednesday },
  { label: "Thursday",  short: "Thu", value: Day.Thursday },
  { label: "Friday",    short: "Fri", value: Day.Friday },
  { label: "Saturday",  short: "Sat", value: Day.Saturday },
];

/* שעות מוצעות לבחירה מהירה */
const QUICK_RANGES = [
  { label: "Morning",   from: "08:00", to: "12:00", icon: "🌅" },
  { label: "Afternoon", from: "12:00", to: "17:00", icon: "☀️" },
  { label: "Evening",   from: "17:00", to: "21:00", icon: "🌆" },
];

export const NewRequestPage = () => {
  useDocumentTitle("New Request");
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const [text,      setText]      = useState("");
  const [day,       setDay]       = useState<Day | null>(null);
  const [fromTime,  setFromTime]  = useState("");
  const [toTime,    setToTime]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  /* בחירת טווח מהיר */
  const applyQuick = (from: string, to: string) => {
    setFromTime(from);
    setToTime(to);
  };
  const isQuickActive = (from: string, to: string) =>
    fromTime === from && toTime === to;

  /* ולידציה */
  const validate = () => {
    const e: Record<string, string> = {};
    if (!text.trim())      e.text     = "Please describe your request";
    if (day === null)      e.day      = "Please choose a day";
    if (!fromTime)         e.fromTime = "Please set a start time";
    if (!toTime)           e.toTime   = "Please set an end time";
    if (fromTime && toTime && fromTime >= toTime)
      e.toTime = "End time must be after start time";
    return e;
  };

  const submit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0 || !user || day === null) return;

    try {
      setLoading(true);

      const availability: AvailabilityType = {
        id: 0,
        userId: user.id,
        day,
        from_Time: fromTime,
        to_Time: toTime,
      };

      const payload: HelpRequestType = {
        id: 0,
        needyID: user.id,
        categoryID: 0,
        description: text.trim(),
        status: 0,
        createdAt: new Date().toISOString(),
        availability,
      };

      const res = await axios.post("/HelpRequests", payload);
      dispatch(addRequestSuccess(res.data));
      setSent(true);
    } catch (err) {
      console.error("Failed to submit request:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (sent) {
  return (
    <div className="req-root">
      <div className="req-success">
        <div className="req-success-icon">🤖</div>
        <h2 className="req-success-title">Request Sent!</h2>
        <p className="req-success-sub">
          Your request has been categorized successfully. We'll match you with a volunteer soon.
        </p>

        <button
          className="req-new-btn"
          onClick={() => {
            setSent(false);
            setText("");
            setDay(null);
            setFromTime("");
            setToTime("");
            setErrors({});
          }}
        >
          + New Request
        </button>
      </div>
    </div>
  );
}
  return (
    <div className="req-root">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }}>

        <div className="req-header">
          <div className="req-tag">New Request</div>
          <h1 className="req-title">Tell us how we can help you</h1>
        </div>

        {/* ── Description ── */}
        <div className="req-card">
          <div className="req-field">
            <label className="req-lbl">
              Describe your request <span className="req-required">*</span>
            </label>
            <textarea
              className={`req-textarea${errors.text ? " req-input-err" : ""}`}
              value={text}
              onChange={(e) => { setText(e.target.value.slice(0, MAX)); setErrors(p => ({...p, text: ""})); }}
              placeholder="Example: My mother is hospitalized and I need help with grocery shopping..."
              rows={5}
            />
            <div className="req-textarea-footer">
              {errors.text
                ? <span className="req-err-msg">{errors.text}</span>
                : <span className={`req-count${text.length >= MAX * 0.9 ? " req-count-warn" : ""}`}>{text.length} / {MAX}</span>
              }
            </div>
          </div>
        </div>

        {/* ── Schedule card ── */}
        <div className="req-card">
          <div className="req-schedule-title">
            <span className="req-schedule-icon">📅</span>
            When do you need help?
          </div>

          {/* Day picker */}
          <div className="req-field">
            <label className="req-lbl">
              Day of the week <span className="req-required">*</span>
            </label>
            <div className="req-days">
              {DAYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  className={`req-day-btn${day === d.value ? " req-day-active" : ""}`}
                  onClick={() => { setDay(d.value); setErrors(p => ({...p, day: ""})); }}
                >
                  <span className="req-day-short">{d.short}</span>
                  <span className="req-day-full">{d.label}</span>
                </button>
              ))}
            </div>
            {errors.day && <span className="req-err-msg">{errors.day}</span>}
          </div>

          {/* Quick time ranges */}
          <div className="req-field">
            <label className="req-lbl">Quick time select</label>
            <div className="req-quick-times">
              {QUICK_RANGES.map(q => (
                <button
                  key={q.label}
                  type="button"
                  className={`req-quick-btn${isQuickActive(q.from, q.to) ? " req-quick-active" : ""}`}
                  onClick={() => applyQuick(q.from, q.to)}
                >
                  <span>{q.icon}</span>
                  <span className="req-quick-label">{q.label}</span>
                  <span className="req-quick-time">{q.from} – {q.to}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual time inputs */}
          <div className="req-time-row">
            <div className="req-field req-time-half">
              <label className="req-lbl">
                From <span className="req-required">*</span>
              </label>
              <input
                type="time"
                className={`req-input${errors.fromTime ? " req-input-err" : ""}`}
                value={fromTime}
                onChange={(e) => { setFromTime(e.target.value); setErrors(p => ({...p, fromTime: ""})); }}
              />
              {errors.fromTime && <span className="req-err-msg">{errors.fromTime}</span>}
            </div>

            <div className="req-time-arrow">→</div>

            <div className="req-field req-time-half">
              <label className="req-lbl">
                To <span className="req-required">*</span>
              </label>
              <input
                type="time"
                className={`req-input${errors.toTime ? " req-input-err" : ""}`}
                value={toTime}
                onChange={(e) => { setToTime(e.target.value); setErrors(p => ({...p, toTime: ""})); }}
              />
              {errors.toTime && <span className="req-err-msg">{errors.toTime}</span>}
            </div>
          </div>

          {/* Summary chip */}
          {day !== null && fromTime && toTime && (
            <div className="req-summary-chip">
              ✓ {DAYS.find(d => d.value === day)?.label} · {fromTime} – {toTime}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="req-submit"
          disabled={loading}
        >
          {loading ? <span className="w1-spinner" /> : <>🤖 Send Request</>}
        </button>

      </form>
    </div>
  );
};

