import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav className="bg-gray-100 p-4 mb-4">
        <div className="container mx-auto flex space-x-4">
          {/* <Link href="/admin" className="text-blue-600 hover:underline">Dashboard</Link> */}
          <Link href="/admin/challenges" className="text-blue-600 hover:underline">All Challenges</Link>
          <Link href="/admin/create-challenge" className="text-blue-600 hover:underline">Create Challenge</Link>
          <Link href="/admin/templates" className="text-blue-600 hover:underline">Manage Templates</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}