export default function BillLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex flex-col gap-3 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-7 w-48 bg-gray-200 rounded" />
        <div className="h-9 w-full bg-gray-100 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-3 px-4 py-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-3 h-16" />
        ))}
      </div>
      <div className="px-4 py-4 border-b border-gray-100 animate-pulse flex flex-col gap-3">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-20 bg-gray-100 rounded-full" />
          ))}
        </div>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3 animate-pulse">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
        <div className="h-32 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  )
}
