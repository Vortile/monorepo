import Link from "next/link";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1 className="text-4xl font-bold">Vortile Storefront</h1>
        <p className="text-default-500 text-lg">
          Welcome to the future of delivery.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded border border-gray-300 px-4 py-2"
          >
            Sign Up
          </Link>
        </div>
      </main>
    </div>
  );
}
