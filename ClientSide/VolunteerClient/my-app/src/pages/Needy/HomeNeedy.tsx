import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Paths } from '../../routes/paths';
import type { RootState, AppDispatch } from '../../redux/store';
import { fetchStart, fetchSuccess, fetchFailure } from '../../redux/slices/helpRequestsSlice';
import { setActiveAssignments } from '../../redux/slices/assignmentsSlice';
import axios from '../../services/axios';
import { HelpRequestStatus } from '../../types/enums.types';
import type { AssignmentType } from '../../types/assignments.types';
import { AssignmentStatus } from '../../types/assignments.types';
import '../../styles/styleHomeNeedy.css';

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'Good morning';
  if (h >= 12 && h < 17) return 'Good afternoon';
  if (h >= 17 && h < 21) return 'Good evening';
  return 'Good night';
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const STATUS_CLASS: Record<number, string> = {
  [HelpRequestStatus.Open]:      'hn-status-pending',
  [HelpRequestStatus.Matched]:   'hn-status-matched',
  [HelpRequestStatus.Completed]: 'hn-status-done',
  [HelpRequestStatus.Cancelled]: 'hn-status-cancelled',
};

const STATUS_LABEL: Record<number, string> = {
  [HelpRequestStatus.Open]:      '⏳ Open',
  [HelpRequestStatus.Matched]:   '✓ Matched',
  [HelpRequestStatus.Completed]: '✅ Completed',
  [HelpRequestStatus.Cancelled]: '✕ Cancelled',
};

const STATUS_ICON: Record<number, string> = {
  [HelpRequestStatus.Open]:      '📋',
  [HelpRequestStatus.Matched]:   '🤝',
  [HelpRequestStatus.Completed]: '✅',
  [HelpRequestStatus.Cancelled]: '❌',
};

const isToday = (iso: string) => {
  const d = new Date(iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z');
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
};

export const HomeNeedy = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user }          = useSelector((state: RootState) => state.auth);
  const { list, loading } = useSelector((state: RootState) => state.helpRequests);
  const activeAssignments = useSelector((state: RootState) => state.assignments.activeAssignments);

  const [enrichedMap, setEnrichedMap] = useState<Record<number, string>>({});

  useEffect(() => {
    document.title = 'Home – Needy';
    dispatch(fetchStart());
    axios.get('/HelpRequests')
      .then(res => dispatch(fetchSuccess(res.data)))
      .catch(() => dispatch(fetchFailure('Failed to load requests')));
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssignments = () => {
      axios.get<AssignmentType[]>(`/assignments/needy/${user.id}/active`)
        .then(res => dispatch(setActiveAssignments(res.data)))
        .catch(err => console.error('Error loading needy assignments:', err));
    };
    fetchAssignments();
    const interval = setInterval(fetchAssignments, 30_000);
    return () => clearInterval(interval);
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id) return;
    const activeMatches = activeAssignments.filter(
      (a: AssignmentType) => a.status === AssignmentStatus.Active
    );
    activeMatches.forEach(async (match) => {
      if (enrichedMap[match.id]) return;
      try {
        const uRes = await axios.get(`/Users/${match.volunteerID}`);
        const name = uRes.data.fullName ?? uRes.data.FullName ?? 'Volunteer';
        setEnrichedMap(prev => ({ ...prev, [match.id]: name }));
      } catch { /* silent */ }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAssignments.length, user?.id]);

  const requests       = list.filter(r => r.needyID === user?.id);
  const openCount      = requests.filter(r => r.status === HelpRequestStatus.Open).length;
  const completedCount = requests.filter(r => r.status === HelpRequestStatus.Completed).length;

  // כל ה-assignments הפעילים
  const allActiveMatches = activeAssignments.filter(
    (a: AssignmentType) => a.status === AssignmentStatus.Active
  );

  // רק שידוכים שנוצרו היום — אלה יוצגו בבאנר ובכרטיס
  const todayMatches = allActiveMatches.filter(a => isToday(a.assignedAt));

  const getVolunteerName = (match: AssignmentType) =>
    enrichedMap[match.id] ?? match.volunteerName ?? 'Volunteer';

  const handleOpenChat = (assignment: AssignmentType) => {
    navigate(Paths.chatNeedy.replace(':assignmentId', String(assignment.id)));
  };

  const STATS = [
    { icon: '📋', num: openCount,               label: 'Open Requests' },
    { icon: '✅', num: completedCount,          label: 'Completed' },
    { icon: '🤝', num: allActiveMatches.length, label: 'Active Matches' },
    { icon: '⭐', num: requests.length,         label: 'Total Requests' },
  ];

  return (
    <div className="hn-root">

      <div className="hn-greeting">
        <h1 className="hn-greeting-h">{getGreeting()}, {user?.fullName ?? 'there'} 👋</h1>
      </div>

      {/* ── באנר — רק שידוכים מהיום ── */}
      {todayMatches.map(match => (
        <div key={match.id} className="hn-match-banner">
          <div className="hn-match-banner-left">
            <span className="hn-match-banner-pulse" />
            <div>
              <div className="hn-match-banner-title">🎉 A volunteer has been matched!</div>
              <div className="hn-match-banner-sub">
                {getVolunteerName(match)} is ready to help
                {match.helpRequestTitle ? ` · ${match.helpRequestTitle}` : ''}
              </div>
            </div>
          </div>
          <button className="hn-match-banner-btn" onClick={() => handleOpenChat(match)}>
            💬 Open Chat
          </button>
        </div>
      ))}

      <div className="hn-stats">
        {STATS.map(s => (
          <div className="hn-stat" key={s.label}>
            <div className="hn-stat-icon">{s.icon}</div>
            <div className="hn-stat-num">{s.num}</div>
            <div className="hn-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="hn-grid">

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="hn-card">
            <div className="hn-card-title">My Requests</div>
            {loading ? (
              <div className="hn-empty">Loading your requests...</div>
            ) : requests.length === 0 ? (
              <div className="hn-empty">No requests yet — submit one to get started!</div>
            ) : (
              requests.map(req => {
                const reqAssignment = activeAssignments.find(
                  (a: AssignmentType) =>
                    a.helpRequestID === req.id && a.status === AssignmentStatus.Active
                );
                return (
                  <div
                    className="hn-req-row"
                    key={req.id}
                    onClick={() => reqAssignment && handleOpenChat(reqAssignment)}
                    style={{ cursor: reqAssignment ? 'pointer' : 'default' }}
                  >
                    <div className="hn-req-icon">{STATUS_ICON[req.status] ?? '📋'}</div>
                    <div className="hn-req-info">
                      <div className="hn-req-title">{req.description}</div>
                      <span className="hn-req-cat">Category #{req.categoryID}</span>
                      <div className="hn-req-date">Submitted {formatDate(req.createdAt)}</div>
                    </div>
                    <div className={`hn-req-status ${STATUS_CLASS[req.status] ?? ''}`}>
                      {STATUS_LABEL[req.status] ?? req.status}
                      {reqAssignment && <span className="hn-req-chat-hint"> · 💬</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="hn-side">

          {/* כרטיס match — רק שידוכים מהיום */}
          {todayMatches.length > 0 ? (
            todayMatches.map(match => (
              <div key={match.id} className="hn-match">
                <div className="hn-match-badge">
                  <span className="hn-match-dot" /> Active Match
                </div>
                <div className="hn-match-name">{getVolunteerName(match)}</div>
                <div className="hn-match-detail">
                  {match.helpRequestTitle ?? `Request #${match.helpRequestID}`}
                  {' · Matched on '}
                  {new Date(match.assignedAt).toLocaleDateString()}
                </div>
                <button className="hn-match-btn" onClick={() => handleOpenChat(match)}>
                  💬 Open Chat
                </button>
              </div>
            ))
          ) : (
            <div className="hn-match" style={{ opacity: 0.5 }}>
              <div className="hn-match-badge" style={{ opacity: 0.6 }}>No Active Matches</div>
              <div className="hn-match-name" style={{ color: 'rgba(26,18,8,0.35)', fontStyle: 'italic' }}>
                Waiting for a volunteer…
              </div>
              <div className="hn-match-detail">We'll notify you as soon as someone is matched.</div>
            </div>
          )}

          <div className="hn-cta" onClick={() => navigate(Paths.NewRequestPage)}>
            <div className="hn-cta-label">✦ Free Service</div>
            <div className="hn-cta-title">Need help? We're here for you</div>
            <div className="hn-cta-sub">
              Describe your need and our AI will find the right volunteer in minutes.
            </div>
            <button className="hn-cta-btn">+ Submit a New Request</button>
          </div>

          <div className="hn-quick">
            <div className="hn-quick-title">Quick Actions</div>
            <button className="hn-quick-btn" onClick={() => navigate(Paths.NewRequestPage)}>
              <span className="hn-quick-icon">✏️</span> New Request
            </button>
            {allActiveMatches.length > 0 && (
              <button className="hn-quick-btn" onClick={() => handleOpenChat(allActiveMatches[0])}>
                <span className="hn-quick-icon">💬</span> Open Messages
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


