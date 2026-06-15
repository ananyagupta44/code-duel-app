import "./globals.css";
import { AuthProvider } from "../context/authContext";
import SocketProvider from "@/components/SocketProvider";
import { DrawerProvider } from "@/context/drawerContext";
import AuthDrawer from "@/components/auth/AuthDrawer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DrawerProvider>
            <SocketProvider>{children}</SocketProvider>

            <AuthDrawer />
          </DrawerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
