import { WifiOffIcon } from "lucide-react";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ReloadButton } from "./reload-button";

export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WifiOffIcon />
          </EmptyMedia>
          <EmptyTitle>You&apos;re offline</EmptyTitle>
          <EmptyDescription>
            Subidha Admin needs a connection to load live bookings and data. Reconnect and try again.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <ReloadButton />
        </EmptyContent>
      </Empty>
    </main>
  );
}
