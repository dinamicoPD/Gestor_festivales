import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Gestor de Festivales</h1>
          <nav className="mt-4 space-x-4">
            <Link href="/grades" className="text-blue-600 hover:underline">Grados</Link>
            <Link href="/blocks" className="text-blue-600 hover:underline">Bloques</Link>
            <Link href="/guardians" className="text-blue-600 hover:underline">Guardianes</Link>
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-4">Bienvenido al Gestor de Festivales</h2>
        <p className="text-gray-600">Use el menú de navegación para gestionar grados, bloques y guardianes.</p>
      </main>
    </div>
  )
}
