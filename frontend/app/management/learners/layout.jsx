import { Suspense } from 'react';

export default function LearnerLayout({ children }) {
  return <Suspense>{children}</Suspense>;
}
