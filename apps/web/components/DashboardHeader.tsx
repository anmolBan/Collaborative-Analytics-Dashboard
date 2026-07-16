import Link from "next/link";

type DashboardHeaderProps = {
  organizationName: string;
  user: {
    email: string;
    name: string;
  };
  role: string;
};

export default function DashboardHeader({
  organizationName,
  role,
  user,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-500/15 bg-[#070a0d]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-200/30 bg-teal-400/15 text-xs font-extrabold tracking-[0.04em] text-teal-100">
            CA
          </span>
          <div>
            <p className="text-sm font-extrabold text-slate-50">
              Collaborative Analytics
            </p>
            <p className="text-xs text-slate-500">{organizationName}</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-slate-200">{user.name}</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <span className="rounded-lg border border-teal-200/20 bg-teal-300/10 px-3 py-2 text-xs font-extrabold text-teal-100">
            {role}
          </span>
        </div>
      </div>
    </header>
  );
}
