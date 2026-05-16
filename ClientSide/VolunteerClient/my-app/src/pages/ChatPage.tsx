import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import axios from '../services/axios';
import type { RootState, AppDispatch } from '../redux/store';
import {
  setMessages,
  appendMessage,
  setLoadingMessages,
  setActiveAssignments,
  setCurrentAssignment,
} from '../redux/slices/assignmentsSlice';
import type { ChatMessageType, AssignmentType } from '../types/assignments.types';
import { AssignmentStatus } from '../types/assignments.types';
import { UserRole } from '../types/enums.types';
import { Paths } from '../routes/paths';
import '../styles/styleChat.css';

const fmtTime = (ts: string) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const fmtDate = (ts: string) => {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const groupByDate = (messages: ChatMessageType[]) => {
  const groups: { date: string; messages: ChatMessageType[] }[] = [];
  messages.forEach(msg => {
    const dateStr = fmtDate(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.date === dateStr) last.messages.push(msg);
    else groups.push({ date: dateStr, messages: [msg] });
  });
  return groups;
};

export const ChatPage = () => {
  useDocumentTitle('Chat');
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const user              = useSelector((state: RootState) => state.auth.user);
  const messages          = useSelector((state: RootState) => state.assignments.messages);
  const loadingMessages   = useSelector((state: RootState) => state.assignments.loadingMessages);
  const activeAssignments = useSelector((state: RootState) => state.assignments.activeAssignments);

  const [input,      setInput]      = useState('');
  const [sending,    setSending]    = useState(false);
  const [assignment, setAssignment] = useState<AssignmentType | null>(null);

  // enriched names cache per assignment id
  const [enrichedMap, setEnrichedMap] = useState<Record<number, { name: string; title: string }>>({});

  const bottomRef  = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  const assignmentIdNum = Number(assignmentId);

  const isVolunteer = assignment
    ? assignment.volunteerID === user?.id
    : user?.userRole === UserRole.Volunteer;

  const otherPersonName = enrichedMap[assignmentIdNum]?.name
    ?? (assignment
      ? (isVolunteer
          ? (assignment.requesterName ?? 'Loading...')
          : (assignment.volunteerName  ?? 'Loading...'))
      : '…');

  const taskTitle =
    enrichedMap[assignmentIdNum]?.title
    ?? assignment?.helpRequestTitle
    ?? `Help Request #${assignment?.helpRequestID ?? assignmentIdNum}`;

  const isClosed =
    assignment !== null && assignment.status !== AssignmentStatus.Active;

  // All active assignments for sidebar
  const allActive = activeAssignments.filter(
    (a: AssignmentType) => a.status === AssignmentStatus.Active
  );

  // ── Load active assignments on mount
  useEffect(() => {
    if (!user?.id) return;
    const endpoint = user.userRole === UserRole.Volunteer
      ? `/assignments/volunteer/${user.id}/active`
      : `/assignments/needy/${user.id}/active`;
    axios.get<AssignmentType[]>(endpoint)
      .then(res => dispatch(setActiveAssignments(res.data)))
      .catch(err => console.error('Failed to fetch assignments:', err));
  }, [user?.id, user?.userRole, dispatch]);

  // ── Enrich names for all active assignments
  useEffect(() => {
    if (!user?.id || allActive.length === 0) return;
    allActive.forEach(async (match) => {
      if (enrichedMap[match.id]) return; // already cached
      try {
        let name = '';
        const title = match.helpRequestTitle ?? `Request #${match.helpRequestID}`;
        if (user.userRole === UserRole.Volunteer) {
          const hrRes = await axios.get(`/HelpRequests/${match.helpRequestID}`);
          const needyId = hrRes.data.needyID ?? hrRes.data.NeedyID;
          const uRes = await axios.get(`/Users/${needyId}`);
          name = uRes.data.fullName ?? uRes.data.FullName ?? 'Requester';
        } else {
          const uRes = await axios.get(`/Users/${match.volunteerID}`);
          name = uRes.data.fullName ?? uRes.data.FullName ?? 'Volunteer';
        }
        setEnrichedMap(prev => ({ ...prev, [match.id]: { name, title } }));
      } catch {
        // silently ignore
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allActive.length, user?.id, user?.userRole]);

  // ── Load current assignment details
  useEffect(() => {
    if (!user?.id || !assignmentIdNum) return;

    const loadAssignment = async () => {
      let match: AssignmentType | undefined =
        activeAssignments.find(a => a.id === assignmentIdNum);

      if (!match) {
        const endpoint = user.userRole === UserRole.Volunteer
          ? `/assignments/volunteer/${user.id}/active`
          : `/assignments/needy/${user.id}/active`;
        try {
          const res = await axios.get<AssignmentType[]>(endpoint);
          dispatch(setActiveAssignments(res.data));
          match = res.data.find(a => a.id === assignmentIdNum);
        } catch (err) {
          console.error('Failed to fetch assignments:', err);
        }
      }

      if (!match) return;
      setAssignment(match);
    };

    loadAssignment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentIdNum, user?.id, user?.userRole]);

  // ── Fetch messages + polling every 4s
  const fetchMessages = useCallback(async () => {
    if (!assignmentIdNum) return;
    try {
      const res = await axios.get<ChatMessageType[]>(
        `/chatmessages/assignment/${assignmentIdNum}`
      );
      dispatch(setMessages(res.data));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  }, [assignmentIdNum, dispatch]);

  useEffect(() => {
    dispatch(setLoadingMessages(true));
    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 4_000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [fetchMessages, dispatch]);

  // ── Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Send message
  const sendMessage = async () => {
    if (!input.trim() || !user?.id || sending) return;
    const content = input.trim();
    setInput('');
    setSending(true);
    try {
      const res = await axios.post<ChatMessageType>('/chatmessages', {
        AssignmentID: assignmentIdNum,
        SenderID: user.id,
        MessageContent: content,
        Timestamp: new Date().toISOString(),
      });
      dispatch(appendMessage(res.data));
    } catch (err) {
      console.error('Failed to send message:', err);
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleSelectChat = (a: AssignmentType) => {
    dispatch(setCurrentAssignment(a.id));
    const path = user?.userRole === UserRole.Volunteer
      ? Paths.chatVolunteer
      : Paths.chatNeedy;
    navigate(path.replace(':assignmentId', String(a.id)));
  };

  const backPath = isVolunteer ? Paths.chatVolunteer : Paths.chatNeedy;
  const grouped  = groupByDate(messages);
  const isMyMessage = (msg: ChatMessageType) =>
    Number(msg.senderID) === Number(user?.id);

  return (
    <div className="chat-layout">

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          <button
            className="chat-back-btn-sidebar"
            onClick={() => navigate(isVolunteer ? Paths.chatVolunteer : Paths.chatNeedy)}
          >
            ← Back
          </button>
          <span className="chat-sidebar-title">Messages</span>
        </div>

        <div className="chat-sidebar-list">
          {allActive.length === 0 ? (
            <div className="chat-sidebar-empty">No active chats</div>
          ) : (
            allActive.map(a => {
              const isActive = a.id === assignmentIdNum;
              const enriched = enrichedMap[a.id];
              const name  = enriched?.name  ?? (isVolunteer ? (a.requesterName ?? '…') : (a.volunteerName ?? '…'));
              const title = enriched?.title ?? a.helpRequestTitle ?? `Request #${a.helpRequestID}`;
              return (
                <div
                  key={a.id}
                  className={`chat-sidebar-item ${isActive ? 'chat-sidebar-item-active' : ''}`}
                  onClick={() => handleSelectChat(a)}
                >
                  <div className="chat-sidebar-avatar">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-sidebar-info">
                    <div className="chat-sidebar-name">{name}</div>
                    <div className="chat-sidebar-task">{title}</div>
                  </div>
                  <span className={`chat-sidebar-dot ${isActive ? 'chat-sidebar-dot-active' : ''}`} />
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ══════════════ MAIN CHAT PANEL ══════════════ */}
      <div className="chat-root">

        {/* ── Header ── */}
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-header-avatar">
              {otherPersonName.charAt(0).toUpperCase()}
            </div>
            <div className="chat-header-text">
              <div className="chat-header-name">{otherPersonName}</div>
              <div className="chat-header-task">{taskTitle}</div>
            </div>
          </div>

          <div className={`chat-status-badge ${isClosed ? 'chat-status-closed' : 'chat-status-active'}`}>
            <span className="chat-status-dot" />
            {isClosed ? 'Closed' : 'Active'}
          </div>
        </div>

        {/* ── Messages area ── */}
        <div className="chat-messages-area">
          {loadingMessages && messages.length === 0 ? (
            <div className="chat-loading">
              <span className="chat-loading-dot" />
              <span className="chat-loading-dot" />
              <span className="chat-loading-dot" />
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-title">Start the conversation</div>
              <div className="chat-empty-sub">
                {isVolunteer
                  ? 'Introduce yourself and confirm the details of the help request.'
                  : 'Your volunteer is ready — say hello and confirm the details!'}
              </div>
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.date} className="chat-date-group">
                <div className="chat-date-label">{group.date}</div>
                {group.messages.map(msg => {
                  const isMe = isMyMessage(msg);
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble-row ${isMe ? 'chat-bubble-row-me' : 'chat-bubble-row-them'}`}
                    >
                      {!isMe && (
                        <div className="chat-avatar-small">
                          {otherPersonName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className={`chat-bubble ${isMe ? 'chat-bubble-me' : 'chat-bubble-them'}`}>
                        <p className="chat-bubble-text">{msg.messageContent}</p>
                        <span className="chat-bubble-time">{fmtTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* ── Input ── */}
        <div className={`chat-input-area ${isClosed ? 'chat-input-area-closed' : ''}`}>
          {isClosed ? (
            <div className="chat-closed-notice">This conversation has been closed.</div>
          ) : (
            <>
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type a message… (Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={sending}
              />
              <button
                className={`chat-send-btn ${!input.trim() ? 'chat-send-btn-disabled' : ''}`}
                onClick={sendMessage}
                disabled={!input.trim() || sending}
              >
                {sending ? (
                  <span className="chat-send-spinner" />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

