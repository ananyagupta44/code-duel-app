export default function MatchInviteModal({ invite, onAccept, onReject }) {
  console.log("MODAL INVITE:", invite);

  if (!invite) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,.8)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#1f1f1f",
          padding: "30px",
          color: "white",
        }}
      >
        <h2>Match Challenge</h2>

        <p>You have been challenged.</p>

        <button onClick={() => onAccept(invite.matchId)}>Accept</button>

        <button onClick={() => onReject()}>Decline</button>
      </div>
    </div>
  );
}
