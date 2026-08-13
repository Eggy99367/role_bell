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
};

function statusLabel(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function statusStripClass(status: string) {
  if (status === 'WAITING') return 'bg-amber-400';
  if (status === 'MATCHED') return 'bg-emerald-500';
  return 'bg-red-500';
}

function PublicBadge() {
  return (
    <span className="shrink-0 rounded-full bg-[#f4f1fa] px-2.5 py-1 text-xs font-medium text-[#6b52a6] ring-1 ring-inset ring-[#6b52a6]/20">
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
    <div className="flex flex-col gap-4 rounded-xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.15)] transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_16px_32px_-12px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-lg">{tracker.title}</h4>
          <p className="truncate text-sm" style={{ color: '#8a76b8' }}>{tracker.company}</p>
        </div>
        {showPublicBadge && isOwner && tracker.is_public && <PublicBadge />}
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

      <div className="mt-auto flex items-center gap-3">
        {isOwner
          ? !tracker.is_public && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="border border-red-600 bg-white text-red-600 hover:bg-red-50"
              >
                {loading ? '...' : 'Delete'}
              </button>
            )
          : (
              <button
                type="button"
                onClick={handleToggle}
                disabled={loading}
                className={isSubscribed ? 'border border-[#6b52a6] bg-white text-[#6b52a6] hover:bg-[#f4f1fa]' : ''}
              >
                {loading ? '...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </button>
            )}

        {tracker.is_public && (
          <span
            className="ml-auto flex items-center gap-1 text-sm text-gray-500"
            title={`${subscriberCount} subscriber${subscriberCount === 1 ? '' : 's'}`}
          >
            <EyeIcon />
            {subscriberCount}
          </span>
        )}
      </div>

      <div
        className={`-mx-5 -mb-5 h-2 rounded-b-xl ${statusStripClass(tracker.status)}`}
        role="img"
        aria-label={`Status: ${statusLabel(tracker.status)}`}
        title={statusLabel(tracker.status)}
      />
    </div>
  );
}
