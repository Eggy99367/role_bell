import { useState } from 'react';

export type Tracker = {
  id: string;
  company: string;
  title: string;
  target_url: string;
  status: string;
  creator_id: string;
};

const STATUS_STYLES: Record<string, string> = {
  WAITING: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  MATCHED: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
};

function StatusBadge({ status }: { status: string }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20'
      }`}
    >
      {label}
    </span>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

export default function TrackerCard({
  tracker,
  isOwner,
  isSubscribed,
  onToggleSubscribe,
}: {
  tracker: Tracker;
  isOwner: boolean;
  isSubscribed: boolean;
  onToggleSubscribe: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await onToggleSubscribe();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg">{tracker.title}</h4>
          <p className="truncate text-sm" style={{ color: '#8a76b8' }}>{tracker.company}</p>
        </div>
        <StatusBadge status={tracker.status} />
      </div>

      <a
        href={tracker.target_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[#6b52a6] no-underline hover:text-[#5b2bca]"
      >
        View posting
        <ExternalLinkIcon />
      </a>

      {!isOwner && (
        <button
          type="button"
          onClick={handleToggle}
          disabled={loading}
          className={`mt-auto ${isSubscribed ? 'border border-[#6b52a6] bg-white text-[#6b52a6] hover:bg-[#f4f1fa]' : ''}`}
        >
          {loading ? '...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}
