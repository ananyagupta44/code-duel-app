"use client";

import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/authContext";
import SocketProvider from "@/components/SocketProvider";
import { DrawerProvider } from "@/context/drawerContext";
import AuthDrawer from "@/components/auth/AuthDrawer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        >
          <AuthProvider>
            <DrawerProvider>
              <SocketProvider>{children}</SocketProvider>

              <AuthDrawer />
            </DrawerProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
