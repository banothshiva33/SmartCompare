'use client';

import Link from 'next/link';

export default function AffiliateNotice() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-100 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200 mb-6">
      <strong className="font-semibold">Affiliate Disclosure:</strong>
      <span className="ml-2">Some links on this site are affiliate links. We may earn a commission when you click through or make a purchase at no extra cost to you.</span>
      <Link href="/terms" className="ml-3 underline font-medium">
        Learn more
      </Link>
    </div>
  );
}
