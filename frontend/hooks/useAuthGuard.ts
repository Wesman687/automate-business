// hooks/useAuthGuard.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Options = {
  /** Require admin role? If false, only requires a valid session. */
  requireAdmin?: boolean;
  /** Extra predicate if you need custom gating (optional). */
  allowWhen?: (user: any) => boolean;
  /** Where to send unauthenticated users. */
  redirectIfUnauthed?: string;           // default: '/portal'
  /** Where to send users who fail the role check. */
  redirectIfWrongRole?: string;          // default: '/customer' if requireAdmin, else '/admin'
};

export function useAuthGuard(opts: Options = {}) {
  const {
    requireAdmin = false,
    allowWhen,
    redirectIfUnauthed = '/portal',
    redirectIfWrongRole = requireAdmin ? '/customer' : '/admin',
  } = opts;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        // Call your Next API proxy (forwards cookies to FastAPI)
        const res = await fetch('/api/check-auth', { cache: 'no-store', signal: ac.signal });

        if (!res.ok) {
          router.replace(redirectIfUnauthed);
          return;
        }

        const data = await res.json();
        const u = data?.user ?? data;

        const roleOK = allowWhen ? allowWhen(u) : (requireAdmin ? !!u?.is_admin : true);
        if (!roleOK) {
          router.replace(redirectIfWrongRole);
          return;
        }

        setUser(u);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          router.replace(redirectIfUnauthed);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [requireAdmin, allowWhen, redirectIfUnauthed, redirectIfWrongRole, router]);

  return { user, loading };
}
