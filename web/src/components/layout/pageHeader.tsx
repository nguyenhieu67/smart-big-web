interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function PageHeader({
  icon,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <div className="card flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-fg flex items-center text-xl font-bold">
          <span className="mr-2 shrink-0">{icon}</span>
          {title}
        </h2>
        <p className="text-fg-muted mt-1 text-xs">{description}</p>
      </div>
      {action}
    </div>
  );
}
