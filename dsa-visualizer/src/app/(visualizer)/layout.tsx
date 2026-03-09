import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MobileSidebarProvider, MobileSidebarDrawer } from "@/components/layout/MobileSidebar";

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileSidebarProvider>
      <div className="flex h-screen w-full bg-paper dark:bg-bg-primary overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />
        {/* Mobile slide-in drawer */}
        <MobileSidebarDrawer />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </MobileSidebarProvider>
  );
}

