"use client";

import { GoogleOAuthProvider as Provider } from "@react-oauth/google";

export function GoogleOAuthProvider({
  children,
  clientId,
}: {
  children: React.ReactNode;
  clientId: string;
}) {
  return <Provider clientId={clientId} locale="en">{children}</Provider>;
}
