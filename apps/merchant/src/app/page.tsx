import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-16 p-8 pb-20 sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
        <h1 className="text-4xl font-bold">Merchant Dashboard</h1>
        <p className="text-default-500 text-lg">
          Manage your store, products, and orders.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="rounded bg-blue-500 px-4 py-2 text-white"
          >
            Login
          </Link>
        </div>
      </main>
    </div>
  );
}
