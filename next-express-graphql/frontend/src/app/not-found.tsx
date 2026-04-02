import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-4xl font-bold">404</h2>
        <h3 className="mt-2 text-2xl font-semibold">Page Not Found</h3>
        <p className="mt-2 text-gray-600">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
