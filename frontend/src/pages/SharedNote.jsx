import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function SharedNote() {
  const { shareId } = useParams();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const res = await api.get(`/notes/shared/${shareId}`);
        setNote(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [shareId]);

  if (loading) {
    return (
      <div className="shared-page">
        <h2>Loading shared note...</h2>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="shared-page">
        <h2>Shared note not found</h2>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-card">
        <h1>{note.title}</h1>

        <div className="note-meta">
          <span className="pill">{note.category}</span>

          {note.tags?.map((tag, index) => (
            <span key={index} className="pill pill-green">
              #{tag}
            </span>
          ))}
        </div>

        <div className="shared-content">{note.content}</div>

        {note.aiSummary && <div className="summary">{note.aiSummary}</div>}
      </div>
    </div>
  );
}
