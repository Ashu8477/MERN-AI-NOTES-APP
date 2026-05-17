import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('General');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [summarizingId, setSummarizingId] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Profile dropdown
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotes = async () => {
    setError('');
    setLoadingNotes(true);
    try {
      const res = await api.get('/notes');
      const notesData = res.data.notes ?? res.data ?? [];
      setNotes(notesData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoadingNotes(false);
    }
  };

  const createNote = async () => {
    if (!content.trim()) return;
    setError('');
    try {
      const res = await api.post('/notes', {
        title,
        content,
        tags: tags.split(',').map((tag) => tag.trim()),
        category,
      });
      setNotes((prev) => [res.data, ...prev]);
      setSelectedNote(res.data);
      setContent('');
      setTitle('');
      setTags('');
      setCategory('General');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create note');
    }
  };

  // const updateNote = async () => {
  //   if (!editContent.trim() || !selectedNote) return;
  //   setError('');
  //   try {
  //     const res = await api.put(`/notes/${selectedNote._id}`, {
  //       content: editContent,
  //     });
  //     setNotes((prev) =>
  //       prev.map((n) => (n._id === selectedNote._id ? res.data : n)),
  //     );
  //     setSelectedNote(res.data);
  //     setIsEditing(false);
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Failed to update note');
  //   }
  // };

  const deleteNote = async (id) => {
    setError('');
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n._id !== id));
      if (selectedNote?._id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const summarize = async (id) => {
    setError('');
    setSummarizingId(id);
    try {
      const res = await api.post(`/ai/notes/${id}/summarize`);
      if (res.data) {
        setNotes((prev) =>
          prev.map((n) => (n._id === id ? { ...n, ...res.data } : n)),
        );
        if (selectedNote?._id === id) {
          setSelectedNote((prev) => ({ ...prev, ...res.data }));
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Summarization failed');
    } finally {
      setSummarizingId(null);
    }
  };

  const startNewNote = () => {
    setSelectedNote(null);
    setIsEditing(false);
    setContent('');
  };

  const selectNote = (note) => {
    setSelectedNote(note);
    setIsEditing(false);
    setEditContent(note.content || '');
  };

  const startEdit = () => {
    setEditContent(selectedNote?.content || '');
    setIsEditing(true);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (!isEditing || !selectedNote) return;

    const timer = setTimeout(async () => {
      try {
        setAutoSaving(true);

        const res = await api.put(`/notes/${selectedNote._id}`, {
          title: selectedNote.title,
          content: editContent,
          tags: selectedNote.tags,
          category: selectedNote.category,
        });

        setNotes((prev) =>
          prev.map((n) => (n._id === selectedNote._id ? res.data : n)),
        );

        setSelectedNote(res.data);
      } catch (err) {
        console.error('Auto save failed', err);
      } finally {
        setAutoSaving(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [editContent]);

  const firstName = user?.fullName?.split(' ')[0] || 'User';
  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags?.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      filterCategory === 'All' || note.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const totalNotes = notes.length;

  const summarizedNotes = notes.filter((note) => note.aiSummary).length;

  const categoryCount = {};

  notes.forEach((note) => {
    if (note.category) {
      categoryCount[note.category] = (categoryCount[note.category] || 0) + 1;
    }
  });

  const mostUsedCategory = Object.keys(categoryCount).reduce(
    (a, b) => (categoryCount[a] > categoryCount[b] ? a : b),
    'None',
  );

  const tagFrequency = {};

  notes.forEach((note) => {
    note.tags?.forEach((tag) => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  const topTags = Object.entries(tagFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const truncate = (str, len = 28) => {
    if (!str) return 'Untitled';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="sidebar-title">Nano Notes</span>
          </div>
          <button
            className="icon-btn"
            onClick={() => setSidebarOpen(false)}
            title="Close sidebar"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        {/* New Note Button */}
        <button className="new-note-btn" onClick={startNewNote}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </button>

        {/* Notes List */}
        <div className="sidebar-notes">
          <div className="sidebar-section-title">Recent Notes</div>
          <div className="sidebar-search">
            <input
              type="text"
              className="sidebar-search-input"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              className="sidebar-search-input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Ideas">Ideas</option>
            </select>
          </div>
          {loadingNotes ? (
            <div className="sidebar-loading">
              <div className="spinner-sm"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="sidebar-empty">No notes yet</div>
          ) : (
            <div className="notes-list-sidebar">
              {filteredNotes.map((note) => (
                <div
                  key={note._id}
                  className={`sidebar-note-item ${selectedNote?._id === note._id ? 'active' : ''}`}
                  onClick={() => selectNote(note)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="sidebar-note-text">
                    {truncate(note.title || note.content)}
                  </span>
                  <button
                    className="sidebar-note-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note._id);
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer - User */}
        <div className="sidebar-footer">
          <div className="profile-wrapper" ref={dropdownRef}>
            <button
              className="sidebar-user-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="avatar">{initials}</div>
              <span className="sidebar-user-name">{firstName}</span>
              <svg
                className={`profile-chevron ${showDropdown ? 'open' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDropdown && (
              <div className="dropdown dropdown-up">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/profile');
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate('/settings');
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  Settings
                </button>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item dropdown-item-danger"
                  onClick={logout}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle */}
      {!sidebarOpen && (
        <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <main className="main-content">
        {error && <div className="alert alert-float">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Notes</h3>
            <p>{totalNotes}</p>
          </div>

          <div className="stat-card">
            <h3>AI Summaries</h3>
            <p>{summarizedNotes}</p>
          </div>

          <div className="stat-card">
            <h3>Top Category</h3>
            <p>{mostUsedCategory}</p>
          </div>

          <div className="stat-card">
            <h3>Top Tags</h3>

            <div className="top-tags">
              {topTags.length > 0 ? (
                topTags.map(([tag, count]) => (
                  <span key={tag} className="pill pill-green">
                    #{tag} ({count})
                  </span>
                ))
              ) : (
                <span>No tags</span>
              )}
            </div>
          </div>
        </div>

        {selectedNote ? (
          /* View/Edit Selected Note */
          <div className="note-view">
            <div className="note-view-header">
              <div className="note-view-badges">
                <span className="pill">{selectedNote.category}</span>
                {selectedNote.aiSummary ? (
                  <span className="pill pill-green">✨ Summarized</span>
                ) : (
                  <span className="pill pill-amber">Not summarized</span>
                )}
              </div>
              <div className="note-view-actions">
                {!isEditing && (
                  <button className="btn btn-ghost" onClick={startEdit}>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit
                  </button>
                )}
                <button
                  className="btn btn-primary"
                  onClick={() => summarize(selectedNote._id)}
                  disabled={summarizingId === selectedNote._id}
                >
                  {summarizingId === selectedNote._id ? (
                    <>
                      <span className="spinner-sm"></span>
                      Summarizing...
                    </>
                  ) : (
                    <>✨ Summarize</>
                  )}
                </button>
              </div>
            </div>

            {isEditing ? (
              <div className="note-edit-area">
                <textarea
                  className="textarea textarea-large"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                  placeholder="Edit your note..."
                />
                <div className="note-edit-actions">
                  <div className="autosave-status">
                    {autoSaving ? 'Saving...' : 'Auto-saved'}
                  </div>
                  {/* <button className="btn btn-green" onClick={updateNote}>
                    Save Changes
                  </button> */}
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="note-meta">
                  <span className="pill">{selectedNote.category}</span>

                  {selectedNote.tags?.map((tag, index) => (
                    <span key={index} className="pill pill-green">
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="note-view-content">
                  {selectedNote.aiSuggestedTitle && (
                    <div className="suggested-title">
                      📝 {selectedNote.aiSuggestedTitle}
                    </div>
                  )}

                  <p className="note-content-text">{selectedNote.content}</p>
                </div>
                {selectedNote.aiSummary && (
                  <div className="summary">
                    <p>{selectedNote.aiSummary}</p>
                  </div>
                )}
                {selectedNote.aiActionItems?.length > 0 && (
                  <div className="summary">
                    <h3>📌 Action Items</h3>

                    <ul className="action-list">
                      {selectedNote.aiActionItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          /* Create New Note */
          <div className="new-note-view">
            <div className="new-note-header">
              <h1>Create a new note</h1>
              <p>Write something and let Nano help you summarize it.</p>
            </div>
            <div className="new-note-input">
              <input
                type="text"
                className="input"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <select
                className="input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Work">Work</option>
                <option value="Study">Study</option>
                <option value="Personal">Personal</option>
                <option value="Ideas">Ideas</option>
              </select>

              <input
                type="text"
                className="input"
                placeholder="Tags (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <textarea
                className="textarea textarea-large"
                rows={6}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="new-note-actions">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={createNote}
                  disabled={!content.trim()}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create Note
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
