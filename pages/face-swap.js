// pages/face-swap.js
import { useState } from 'react'
import { FaPlay } from 'react-icons/fa'

const scenes = [
  {
    id: 'meet-joe-black',
    name: 'Meet Joe Black (1998)',
    actor: 'Brad Pitt',
    url: 'https://bliskioptyk.pl/videos/Brad%20Pitt.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Brad%20Pitt.jpg',
  },
  {
    id: 'bridget-jones',
    name: "Bridget Jones's Diary (2001)",
    actor: 'Renée Zellweger',
    url: 'https://bliskioptyk.pl/videos/Renee%20Zellweger.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Renee%20Zellweger.jpg',
  },
  {
    id: 'wolf-wall-street',
    name: 'The Wolf of Wall Street (2013)',
    actor: 'Leonardo DiCaprio',
    url: 'https://bliskioptyk.pl/videos/Leonardo%20DiCaprio.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Leonardo%20DiCaprio.jpg',
  },
  {
    id: 'godfather',
    name: 'The Godfather (1972)',
    actor: 'Marlon Brando',
    url: 'https://bliskioptyk.pl/videos/Marlon%20Brando.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Marlon%20Brando.jpg',
  },
  {
    id: 'forrest-gump',
    name: 'Forrest Gump (1994)',
    actor: 'Tom Hanks',
    url: 'https://bliskioptyk.pl/videos/Forrest%20Gump.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Forrest%20Gump.jpg',
  },
  {
    id: 'lucy',
    name: 'Lucy (2014)',
    actor: 'Scarlett Johansson',
    url: 'https://bliskioptyk.pl/videos/Scarlett%20Johansson.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Scarlett%20Johansson.jpg',
  },
  {
    id: 'shining',
    name: 'The Shining (1980)',
    actor: 'Jack Nicholson',
    url: 'https://bliskioptyk.pl/videos/Jack%20Nicholson.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Jack%20Nicholson.jpg',
  },
  {
    id: 'pulp-fiction',
    name: 'Pulp Fiction (1994)',
    actor: 'Samuel L. Jackson',
    url: 'https://bliskioptyk.pl/videos/Samuel%20L%20Jackson.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Samuel%20L%20Jackson.jpg',
  },
  {
    id: 'braveheart',
    name: 'Braveheart (1995)',
    actor: 'Mel Gibson',
    url: 'https://bliskioptyk.pl/videos/Mel%20Gibson.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Mel%20Gibson.jpg',
  },
  {
    id: 'dark-knight',
    name: 'The Dark Knight (2008)',
    actor: 'Heath Ledger',
    url: 'https://bliskioptyk.pl/videos/Heath%20Ledger.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Heath%20Ledger.jpg',
  },
  {
    id: 'blinded-lights',
    name: 'Blinded By The Lights (2018)',
    actor: 'Jan Frycz',
    url: 'https://bliskioptyk.pl/videos/Jan%20Frycz.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Jan%20Frycz.jpg',
  },
  {
    id: 'iron-man-2',
    name: 'Iron Man 2 (2010)',
    actor: 'Robert Downey Jr.',
    url: 'https://bliskioptyk.pl/videos/Robert%20Downey%20Jr.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Robert%20Downey%20Jr.jpg',
  },
  {
    id: 'spider-man-2',
    name: 'Spider Man 2 (2004)',
    actor: 'Tobey Maguire',
    url: 'https://bliskioptyk.pl/videos/Tobey%20Maguire.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Tobey%20Maguire.jpg',
  },
  {
    id: 'bruce-almighty',
    name: 'Bruce Almighty (2003)',
    actor: 'Steve Carell',
    url: 'https://bliskioptyk.pl/videos/Steve%20Carell.mp4',
    thumbnail: 'https://bliskioptyk.pl/images/Steve%20Carell.jpg',
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
                <div className="bg-gray-900 py-2 px-1">
                  <div className="font-bold text-sm text-center">{scene.name}</div>
                  <div className="text-xs text-gray-300 text-center mt-1">{scene.actor}</div>
                </div>
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
