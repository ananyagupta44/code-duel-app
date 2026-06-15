import Footer from "@/components/Footer";
import Navbar from "@/components/navbar";

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
