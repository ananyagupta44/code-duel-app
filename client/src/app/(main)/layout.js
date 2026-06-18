import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";
import ActiveMatchBanner from "@/components/tournament/ActiveMatchBanner";
import TournamentCountdownBanner from "@/components/tournament/TournamentCountdownBanner";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <ActiveMatchBanner />
      <TournamentCountdownBanner />
      <Footer />
    </>
  );
}
