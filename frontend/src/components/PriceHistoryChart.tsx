'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PricePoint } from '@/types/price';

interface Props {
  data?: PricePoint[];
}

/**
 * ✅ TypeScript-safe formatter for Recharts Tooltip
 */
const priceFormatter = (value: unknown): [string, string] => {
  const price = Number(value);
  return [`₹${price.toLocaleString()}`, 'Price'];
};

export default function PriceHistoryChart({ data = [] }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="mt-10 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
      <h3 className="text-lg font-bold mb-4">📉 Price History</h3>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={priceFormatter} />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        💡 Tip: Prices often drop during sales & weekends.
      </p>
    </div>
  );
}