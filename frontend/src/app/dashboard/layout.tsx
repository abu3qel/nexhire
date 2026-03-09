import Sidebar from "@/components/layout/SideBar"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}