const COLORS = {
  blue: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
  },

  green: {
    bg: "bg-green-50",
    icon: "text-green-600",
  },

  red: {
    bg: "bg-red-50",
    icon: "text-red-600",
  },

  purple: {
    bg: "bg-purple-50",
    icon: "text-purple-600",
  },
};

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "blue",
}) {
  const theme = COLORS[color] ?? COLORS.blue;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">{value}</h2>

          <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
        </div>

        {Icon && (
          <div className={`rounded-2xl p-3 ${theme.bg}`}>
            <Icon size={24} className={theme.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
