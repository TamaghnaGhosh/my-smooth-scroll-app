import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center w-[420px]">
        
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          About Page
        </h1>

        <div className="flex flex-col gap-4 mb-6">
          
          <Link
            href="/#profile"
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Profile Section
          </Link>

          <Link
            href="/#settings"
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Go to Settings Section
          </Link>

        </div>

        <Link
          href="/"
          className="text-gray-600 hover:text-black underline"
        >
          Back to Home
        </Link>

      </div>

    </div>
  );
}