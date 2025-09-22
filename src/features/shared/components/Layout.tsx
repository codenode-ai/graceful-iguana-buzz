import { useAuth } from "@/shared/hooks/useAuth";
import Sidebar from "./Sidebar";
import Header from "./Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar user={auth.user} profile={auth.profile} company={auth.company} />
      <div className="flex w-full flex-1 flex-col overflow-hidden">
        <Header auth={auth} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
