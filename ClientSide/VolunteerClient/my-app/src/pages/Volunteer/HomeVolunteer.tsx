import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Paths } from '../../routes/paths';
import type { AvailabilityType } from '../../types/availabilities.types';
import { Day } from '../../types/enums.types';
import '../../styles/styleHomeVolunteer.css';
import axios from '../../services/axios';
import type { RootState, AppDispatch } from '../../redux/store';
import { setSlots, setPeopleHelped } from '../../redux/slices/volunteerSlice';
import { setActiveAssignments, setCurrentAssignment } from '../../redux/slices/assignmentsSlice';
import type { AssignmentType } from '../../types/assignments.types';
import { AssignmentStatus } from '../../types/assignments.types';

const DAY_NAMES: Record<number, string> = {
  [Day.Sunday]: 'Sunday',   [Day.Monday]: 'Monday',
  [Day.Tuesday]: 'Tuesday', [Day.Wednesday]: 'Wednesday',
  [Day.Thursday]: 'Thursday',[Day.Friday]: 'Friday',
  [Day.Saturday]: 'Saturday',
};

const fmtTime = (t: string) => t.slice(0, 5);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
};

// האם תאריך iso הוא היום (מתחשב ב-timezone)
const isToday = (iso: string) => {
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z');
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
};

export const HomeVolunteer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user              = useSelector((state: RootState) => state.auth.user);
  const slots             = useSelector((state: RootState) => state.volunteer.slots);
  const peopleHelped      = useSelector((state: RootState) => state.volunteer.peopleHelped);
  const activeAssignments = useSelector((state: RootState) => state.assignments.activeAssignments);

  useEffect(() => {
    if (!user?.id) return;
    axios.get<AvailabilityType[]>(`/Availabilities/user/${user.id}`)
      .then(res => dispatch(setSlots(res.data)))
      .catch(err => console.error('Failed to fetch availabilities:', err));
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    axios.get<number>(`/assignments/volunteer/${user.id}/helped-count`)
      .then(res => dispatch(setPeopleHelped(res.data)))
      .catch(err => console.error('Error loading helped count:', err));
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      try {
        const res = await axios.get<AssignmentType[]>(`/assignments/volunteer/${user.id}/active`);
        dispatch(setActiveAssignments(res.data.filter(a => a.volunteerID === user.id)));
      } catch (err) { console.error('Error loading assignments:', err); }
    };
    fetch();
    const interval = setInterval(fetch, 30_000);
    return () => clearInterval(interval);
  }, [user?.id, dispatch]);

  const handleOpenChat = (assignment: AssignmentType) => {
    dispatch(setCurrentAssignment(assignment.id));
    navigate(Paths.chatVolunteer.replace(':assignmentId', String(assignment.id)));
  };

  // כל ה-assignments הפעילים של המתנדב
  const allActiveMatches = activeAssignments.filter(
    (a: AssignmentType) => a.status === AssignmentStatus.Active && a.volunteerID === user?.id,
  );

  // רק שידוכים שנוצרו היום — אלה יוצגו בבאנר ובכרטיס
  const todayMatches = allActiveMatches.filter(a => isToday(a.assignedAt));
  const todayMatch   = todayMatches[0] ?? null;

  const firstName = user?.fullName?.split(' ')[0] ?? '';

  return (
    <div className="hv-root">

      {/* ── HERO ── */}
      <div className="hv-hero">
        <div className="hv-greeting">{getGreeting()},&nbsp;<span>{firstName}</span> 👋</div>
        <div className="hv-hero-stat">
          <span className="hv-hero-stat-n">{peopleHelped}</span>
          <span className="hv-hero-stat-lbl">People Helped</span>
        </div>
        <div className="hv-hero-stat">
          <span className="hv-hero-stat-n">{slots.length}</span>
          <span className="hv-hero-stat-lbl">Weekly Slots</span>
        </div>
      </div>

      {/* ── באנר — רק אם השידוך היה היום ── */}
      {todayMatch && (
        <div className="hv-match-banner">
          <div className="hv-match-banner-left">
            <span className="hv-match-banner-pulse" />
            <div>
              <div className="hv-match-banner-title">
                🎉 {todayMatches.length > 1 ? `${todayMatches.length} new matches today!` : "You've been matched!"}
              </div>
              <div className="hv-match-banner-sub">
                {todayMatch.helpRequestTitle ?? `Help Request #${todayMatch.helpRequestID}`}
                {todayMatch.requesterName ? ` · ${todayMatch.requesterName}` : ''}
                {todayMatches.length > 1 ? ` · +${todayMatches.length - 1} more` : ''}
              </div>
            </div>
          </div>
          <button className="hv-match-banner-btn" onClick={() => navigate(Paths.chatVolunteer)}>
            💬 Open Chat
          </button>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="hv-grid">

        <div className="hv-card hv-avail">
          <div className="hv-card-title">This Week's Availability</div>
          {slots.length === 0 ? (
            <div className="hv-empty">No slots added yet.</div>
          ) : (
            <div className="hv-slot-list">
              {slots.map((slot, i) => (
                <div key={i} className="hv-slot-row">
                  <span className="hv-slot-dot hv-dot-available" />
                  <span className="hv-slot-day">{DAY_NAMES[slot.day]}</span>
                  <span className="hv-slot-time">{fmtTime(slot.from_Time)} – {fmtTime(slot.to_Time)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hv-right">

          {/* כרטיס match — רק אם השידוך היה היום */}
          {todayMatches.length > 0 ? (
            todayMatches.map(match => (
              <div key={match.id} className="hv-card hv-match">
                <div className="hv-match-tag"><span className="hv-match-dot" /> New Match Today</div>
                <div className="hv-match-name">
                  {match.requesterName ?? 'Requester'} —{' '}
                  {match.helpRequestTitle ?? `Request #${match.helpRequestID}`}
                </div>
                <div className="hv-match-detail">
                  {match.requesterCity ?? ''}{' · Matched on '}{new Date(match.assignedAt).toLocaleDateString()}
                </div>
                <button className="hv-chat-btn" onClick={() => handleOpenChat(match)}>
                  💬 Open Chat
                </button>
              </div>
            ))
          ) : (
            <div className="hv-card hv-match hv-match-empty">
              <div className="hv-match-tag hv-match-tag-idle">
                <span className="hv-match-dot-idle" /> No Active Match
              </div>
              <div className="hv-match-name hv-match-name-idle">Waiting for a match…</div>
              <div className="hv-match-detail">
                We'll notify you as soon as someone needs your help.
              </div>
            </div>
          )}

          <div className="hv-card hv-actions">
            <div className="hv-card-title hv-actions-title">Quick Actions</div>
            <button className="hv-action-btn" onClick={() => navigate(Paths.SchedulePage)}>
              <span className="hv-action-icon">✚</span> Add Availability
            </button>
            <button className="hv-action-btn" onClick={() => navigate(Paths.SchedulePage)}>
              <span className="hv-action-icon">📋</span> View Full Schedule
            </button>
            {allActiveMatches.length > 0 && (
              <button className="hv-action-btn" onClick={() => navigate(Paths.chatVolunteer)}>
                <span className="hv-action-icon">💬</span> Open Messages
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};









