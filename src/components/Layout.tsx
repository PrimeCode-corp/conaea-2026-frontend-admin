import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className='flex flex-col flex-1 min-h-svh bg-[#111] border-l border-white/10'>
        <div className='sticky top-0 z-10 flex items-center h-10 px-3 border-b border-white/10 bg-[#111] shrink-0'>
          <SidebarTrigger className='text-slate-200 cursor-pointer border border-white/10 hover:bg-[#fbba0e] hover:text-black transition' />
        </div>
        <div
          className='flex-1 overflow-y-auto p-8'
          style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
        >
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
