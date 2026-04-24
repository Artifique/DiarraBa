import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col transition-all duration-300 md:ml-[260px] has-[aside.w-\[80px\]]:md:ml-[80px]">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
