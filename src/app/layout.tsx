import type { Metadata } from 'next';
import './globals.css';
import { WorkspaceProvider } from '@/features/WorkspaceContext';

export const metadata: Metadata = {
  title: 'OrbitFlow — Universal SaaS Project Management Platform',
  description: 'Multi-tenant reusable SaaS project management workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
