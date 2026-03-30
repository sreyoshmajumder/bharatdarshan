import { useEffect, useRef } from 'react';
import { useNotif } from '../context/NotifContext';

export default function NotificationToast() {
  const { notifications, removeNotification } = useNotif();

  return (
    <div className="notification-toast" id="notification-toast-container">
      {notifications.map(notif => (
        <ToastItem
          key={notif.id}
          notif={notif}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ notif, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 7500);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  return (
    <div className="toast-item" role="alert">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="toast-header">
          <span className="toast-icon">{notif.emoji || '📍'}</span>
          <span className="toast-title">{notif.title}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--clr-text-muted)',
            cursor: 'pointer',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '0 0 0 8px',
          }}
        >
          ×
        </button>
      </div>
      <p className="toast-body" style={{ marginTop: '6px' }}>{notif.body}</p>
      {notif.importance && (
        <p style={{
          fontSize: '0.78rem',
          color: 'var(--clr-saffron-light)',
          marginTop: '8px',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          {notif.importance}
        </p>
      )}
    </div>
  );
}
