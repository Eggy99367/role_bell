import { useEffect, useState } from 'react';

export type Tracker = {
  id: string;
  company: string;
  title: string;
  target_url: string;
  status: string;
  creator_id: string;
  is_public: boolean;
  subscriber_count: number;
  created_at: string;
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatCreatedAt(createdAt: string) {
  return new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function statusStripClass(status: string) {
  if (status === 'WAITING') return 'bg-amber-600';
  if (status === 'MATCHED') return 'bg-emerald-600';
  return 'bg-red-600/90';
}

function PublicBadge() {
  return (
    <span className="shrink-0 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-300 ring-1 ring-inset ring-violet-400/30">
      Public
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

function EyeIcon() {
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
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function TrackerCard({
  tracker,
  isOwner,
  isSubscribed,
  onToggleSubscribe,
  onDelete,
  showPublicBadge = true,
}: {
  tracker: Tracker;
  isOwner: boolean;
  isSubscribed: boolean;
  onToggleSubscribe: () => Promise<boolean>;
  onDelete?: () => Promise<void>;
  showPublicBadge?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(tracker.subscriber_count);

  useEffect(() => {
    setSubscriberCount(tracker.subscriber_count);
  }, [tracker.subscriber_count]);

  const handleToggle = async () => {
    const delta = isSubscribed ? -1 : 1;
    setSubscriberCount((count) => count + delta);
    setLoading(true);
    const ok = await onToggleSubscribe();
    setLoading(false);
    if (!ok) setSubscriberCount((count) => count - delta);
  };

  const handleDelete = async () => {
    if (!onDelete || !window.confirm(`Delete "${tracker.title}"? This can't be undone.`)) return;
    setLoading(true);
    await onDelete();
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 shadow-[0_1px_2px_rgba(0,0,0,0.2),0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-shadow hover:border-violet-500/40 hover:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_16px_32px_-12px_rgba(124,58,237,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg text-[#f1eefa]">{tracker.title}</h4>
          <p className="truncate text-sm text-violet-300">{tracker.company}</p>
          <p className="text-xs text-[#6b6480]">Created {formatCreatedAt(tracker.created_at)}</p>
        </div>
        {showPublicBadge && isOwner && tracker.is_public && <PublicBadge />}
      </div>

      <a
        href={tracker.target_url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-violet-300 no-underline hover:text-violet-200"
      >
        View posting
        <ExternalLinkIcon />
      </a>

      <div className="mt-auto flex items-center gap-3">
        {isOwner
          ? !tracker.is_public && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="border border-red-600 bg-transparent text-red-400 hover:bg-red-950/50"
              >
                {loading ? '...' : 'Delete'}
              </button>
            )
          : tracker.status !== 'MATCHED' && (
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={isSubscribed ? 'border border-violet-500 bg-transparent text-violet-300 hover:bg-violet-500/10' : ''}
              >
                {loading ? '...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            )}

        {tracker.is_public && (
          <span
            className="ml-auto flex items-center gap-1 text-sm text-[#9a8fb8]"
            title={`${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}
          >
            <EyeIcon />
            {subscriberCount}
          </span>
        )}
      </div>

      <div
        className={`-mx-5 -mb-5 flex h-7 items-center justify-center gap-1.5 rounded-b-xl text-xs font-medium text-white ${statusStripClass(tracker.status)}`}
      >
        {tracker.status === 'WAITING' && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulsering" />}
        {statusLabel(tracker.status)}
      </div>
    </div>
  );
}
