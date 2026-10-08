import { User } from "lucide-react";

export interface StaffDirectoryItem {
  id: string;
  name: string;
  position: string;
  photo_url: string | null;
  details: { label: string; value: string }[];
}

export default function StaffDirectory({
  staff,
  emptyMessage,
}: {
  staff: StaffDirectoryItem[];
  emptyMessage: string;
}) {
  if (staff.length === 0) {
    return <p className="py-16 text-center text-sm italic text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 justify-items-center gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-6 lg:gap-x-12">
      {staff.map((person, index) => {
        const remainder = staff.length % 3;
        const isLast = index === staff.length - 1;
        const isPenultimate = index === staff.length - 2;
        const centeredTabletLast = staff.length % 2 === 1 && isLast;
        const desktopPosition =
          remainder === 1 && isLast
            ? "lg:col-start-3"
            : remainder === 2 && isPenultimate
              ? "lg:col-start-2"
              : remainder === 2 && isLast
                ? "lg:col-start-4"
                : "";

        return (
        <article key={person.id} className={`group flex w-full max-w-md flex-col transition-transform duration-300 hover:-translate-y-1 sm:col-span-1 sm:col-start-auto lg:col-span-2 ${centeredTabletLast ? "sm:col-start-2" : ""} ${desktopPosition}`}>
          <div className="relative mx-auto aspect-4/5 w-full overflow-hidden">
            {person.photo_url ? (
              <img src={person.photo_url} alt={person.name} loading="lazy" className="h-full w-full object-cover object-center drop-shadow-[0_20px_30px_rgba(0,0,0,0.28)] transition-transform duration-500 group-hover:scale-[1.02]" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                <User className="h-16 w-16 stroke-1 text-slate-600" />
                <span className="mt-2 text-xs font-medium">Foto Belum Tersedia</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#0a1429] to-transparent" />
          </div>
          <div className="mt-5 flex flex-1 flex-col items-center px-2 text-center">
            <h2 title={person.name} className="max-w-full overflow-x-auto whitespace-nowrap text-base font-bold leading-snug text-white transition-colors group-hover:text-amber-300 sm:text-lg">{person.name}</h2>
            <p title={person.position} className="mt-2 max-w-full overflow-x-auto whitespace-nowrap text-xs font-medium uppercase tracking-wider text-amber-400/80 sm:text-sm">{person.position}</p>
            {person.details.length > 0 && (
              <dl className="mt-5 w-full space-y-3 border-t border-slate-700/50 pt-4 text-center text-xs sm:text-sm">
                {person.details.map((detail) => (
                  <div key={detail.label} className="flex min-w-0 flex-col items-center gap-1">
                    <dt className="max-w-full overflow-x-auto whitespace-nowrap text-slate-500">{detail.label}</dt>
                    <dd title={detail.value} className="max-w-full overflow-x-auto whitespace-nowrap leading-relaxed text-slate-400">{detail.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </article>
        );
      })}
    </div>
  );
}
