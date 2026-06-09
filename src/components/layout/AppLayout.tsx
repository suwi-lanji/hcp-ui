import { AppShell } from "@mantine/core";
import { TopBar } from "./TopBar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={{ height: 48 }} padding="xl">
      <TopBar />
      <AppShell.Main
        style={{
          background: "var(--sap-background-color)",
          minHeight: "calc(100vh)",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
