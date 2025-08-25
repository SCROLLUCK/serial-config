import { Outlet } from "react-router-dom";

export default function AppLayout() {
  return (
    <main className="w-full flex flex-col flex-1 overflow-y-auto">
      <div className="p-6">
        <Outlet />
      </div>
    </main>
  );
}
