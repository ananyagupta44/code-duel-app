import "./globals.css";
import { AuthProvider } from "../context/authContext";
import SocketProvider from "@/components/SocketProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
