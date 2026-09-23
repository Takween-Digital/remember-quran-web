export const revalidate = false
export const dynamic = "force-static"

export default function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Remember Quran</h1>
        <p className="text-xl text-gray-600 mb-8">Quran Learning Platform</p>
        <a href="/1" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start Reading
        </a>
      </div>
    </div>
  )
}
