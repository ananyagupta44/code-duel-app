import "../css/MatchInviteModal.css";

export default function MatchInviteModal({ invite, onAccept, onReject }) {
  if (!invite) return null;

  return (
    <div className="invite-overlay">
      <div className="invite-modal">
        <div className="invite-glow"></div>

        <span className="invite-badge">⚔ DUEL REQUEST</span>

        <h2>{invite.challenger}</h2>

        <p>has challenged you to a coding duel.</p>

        <div className="invite-actions">
          <button
            className="accept-btn"
            onClick={() => onAccept(invite.matchId)}
          >
            ACCEPT
          </button>

          <button className="decline-btn" onClick={onReject}>
            DECLINE
          </button>
        </div>
      </div>
    </div>
  );
}
