// pages/face-swap.js
import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'

const scenes = [
  {
    id: 'bruce',
    name: 'Bruce Almighty',
    url: 'https://bliskioptyk.pl/videos/Bruce%20Almighty.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Bruce%20Almighty.jpg',
  },
  {
    id: 'forrest',
    name: 'Forrest Gump',
    url: 'https://bliskioptyk.pl/videos/Forrest%20Gump.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Forrest%20Gump.jpg',
  },
  {
    id: 'ironman',
    name: 'Iron Man',
    url: 'https://bliskioptyk.pl/videos/Iron%20Man.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Iron%20Man.jpg',
  },
  {
    id: 'jadore',
    name: 'Jadore Dior',
    url: 'https://bliskioptyk.pl/videos/Jadore%20Dior.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Jadore%20Dior.jpg',
  },
  {
    id: 'vandamme',
    name: 'Van Damme',
    url: 'https://bliskioptyk.pl/videos/Van%20Damme.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Van%20Damme.jpg',
  },
  {
    id: 'woman1',
    name: 'Woman 1',
    url: 'https://bliskioptyk.pl/videos/Woman1.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Woman1.jpg',
  },
]

export default function CultFacePage() {
  const [selectedScene, setSelectedScene] = useState(scenes[0])
  const [customUrl, setCustomUrl] = useState('')
  const [faceFile, setFaceFile] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [outputUrl, setOutputUrl] = useState(null)
  const [error, setError] = useState(null)

  const handleSceneSelect = (scene) => {
    setSelectedScene(scene)
    setCustomUrl('')
    setOutputUrl(null)
    setError(null)
  }

  const handleCustomUrlChange = (e) => {
    setCustomUrl(e.target.value)
    setSelectedScene(null)
    setOutputUrl(null)
    setError(null)
  }

  const handleFaceChange = (e) => {
    setFaceFile(e.target.files[0])
    setOutputUrl(null)
    setError(null)
  }

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleCreate = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)
    setOutputUrl(null)

    const videoUrl = customUrl || selectedScene?.url
    if (!videoUrl) {
      setError('Wybierz scenę lub podaj URL wideo')
      setProcessing(false)
      return
    }
    if (!faceFile) {
      setError('Wgraj zdjęcie twarzy')
      setProcessing(false)
      return
    }

    try {
      const base64 = await fileToBase64(faceFile)
      const res = await fetch('/api/face-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceBase64: base64, videoUrl }),
      })

      const ct = (res.headers.get('Content-Type') || '').toLowerCase()
      if (ct.includes('application/json')) {
        const json = await res.json()
        if (json.demo) setOutputUrl(json.url)
        else throw new Error(json.error || 'Błąd z API')
      } else if (ct.includes('video')) {
        const blob = await res.blob()
        setOutputUrl(URL.createObjectURL(blob))
      } else {
        const text = await res.text()
        throw new Error(`Nieoczekiwana odpowiedź serwera: ${ct}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="bg-black text-white min-h-screen pb-10">
      <header className="py-6 px-8 border-b border-gray-800">
        <h1 className="text-3xl font-bold">CULTFACE</h1>
      </header>

      <main className="container mx-auto px-8 mt-8">
        {/* Netflix-style row */}
        <section>
          <h2 className="text-xl mb-4">Wybierz scenę</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleSceneSelect(scene)}
                className={`relative group rounded overflow-hidden shadow-lg transform transition
                  ${selectedScene?.id === scene.id ? 'scale-105 ring-4 ring-red-600' : `hover:scale-105`}`}
              >
                <img
                  src={scene.thumbnail}
                  alt={scene.name}
                  className="w-full h-40 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                  <FaPlay className="text-3xl text-white" />
                </div>
                <span className="block text-center bg-gray-900 py-1">{scene.name}</span>
              </button>
            ))}
            {/* Custom URL */}
            <div className="flex flex-col">
              <input
                type="url"
                placeholder="Własny URL wideo"
                value={customUrl}
                onChange={handleCustomUrlChange}
                className="w-full p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>
        </section>

        {/* Podgląd wideo */}
        {(selectedScene || customUrl) && (
          <section className="mt-8">
            <h2 className="text-xl mb-2">Podgląd wideo</h2>
            <video
              src={customUrl || selectedScene.url}
              controls
              className="w-full rounded-lg shadow-lg"
            />
          </section>
        )}

        {/* Formularz */}
        <form onSubmit={handleCreate} className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl mb-2">Wgraj zdjęcie twarzy</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFaceChange}
              className="file:bg-red-600 file:text-white file:px-4 file:py-2 file:rounded file:cursor-pointer bg-gray-800 p-2 rounded w-full"
              required
            />
          </div>
          <button
            type="submit"
            disabled={processing}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded w-full"
          >
            {processing ? 'Przetwarzanie...' : 'Stwórz Face-Swap'}
          </button>
        </form>

        {/* Wynik / Błąd */}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {outputUrl && (
          <section className="mt-6">
            <h2 className="text-xl mb-2">Wynik</h2>
            <video src={outputUrl} controls className="w-full rounded-lg shadow-lg" />
          </section>
        )}
      </main>
    </div>
  )
}
