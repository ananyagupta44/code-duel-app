import Link from "next/link";
import { RiSwordLine } from "react-icons/ri";
import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";
import "../css/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <RiSwordLine />
            <span>CodeDuel</span>
          </div>
          <p>
            Online coding arena for competitive 1v1 duels. Climb the
            leaderboard, sharpen your skills, and prove your code under fire.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="GitHub">
              <FaGithub />
            </a>
            <a href="#" aria-label="Discord">
              <FaDiscord />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Play</h4>
            <Link href="/lobby">Find Match</Link>
            <Link href="/practice">Practice</Link>
            <Link href="/ai">Play vs AI</Link>
            <Link href="/matches">Spectate</Link>
          </div>

          <div className="footer-col">
            <h4>Compete</h4>
            <Link href="/leaderboard">Leaderboard</Link>
            <Link href="/create-game">Challenge a Friend</Link>
          </div>

          <div className="footer-col">
            <h4>Account</h4>
            <Link href="/profile">Profile</Link>
            <Link href="/settings">Settings</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CodeDuel. All rights reserved.</span>
        <div className="footer-bottom-links">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
