import Link from "next/link";

type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  action?: {
    label: string;
    href: string;
  };
  badge?: {
    label: string;
    color: string;
  };
};

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {badge && (
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}>
              {badge.label}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && (
          <Link
            href={action.href}
            className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-sm font-bold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
          >
            {action.label}
          </Link>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {backLabel || "Volver"}
          </Link>
        )}
      </div>
    </div>
  );
}
