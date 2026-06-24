'use client';

import { ReactNode } from 'react';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { getConvexUrl } from '@math-platform/core-convex/config';

const convex = new ConvexReactClient(getConvexUrl());

/**
 * Provides the Convex client context for the React tree.
 * @param {ReactNode} children - React nodes to wrap with Convex provider
 * @returns {import("react").JSX.Element} ConvexProvider wrapping children
 */
export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
