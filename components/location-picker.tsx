"use client"

import "leaflet/dist/leaflet.css"
import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { X, MapPin, Loader2, Locate } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LocationPickerProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { address: string; lat: number; lng: number }) => void
}

// Default center: Marrakech, Morocco — a sensible default for a Moroccan store.
const DEFAULT_CENTER: [number, number] = [31.6295, -7.9811]

export function LocationPicker({ isOpen, onClose, onConfirm }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [address, setAddress] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [locating, setLocating] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ display_name: string; lat: string; lon: string }[]>([])

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return

    let cancelled = false

    async function initMap() {
      const L = (await import("leaflet")).default

      // Fix default marker icon paths (leaflet's default assets don't resolve well in bundlers)
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })

      if (cancelled || !mapContainerRef.current) return

      const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(DEFAULT_CENTER, 13)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20,
        subdomains: "abcd",
      }).addTo(map)

      const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map)

      async function reverseGeocode(lat: number, lng: number) {
        setLoadingAddress(true)
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          )
          const data = await res.json()
          const display = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          setAddress(display)
        } catch {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        } finally {
          setLoadingAddress(false)
        }
      }

      function handlePositionChange(lat: number, lng: number) {
        setCoords({ lat, lng })
        reverseGeocode(lat, lng)
      }

      marker.on("dragend", () => {
        const pos = marker.getLatLng()
        handlePositionChange(pos.lat, pos.lng)
      })

      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng)
        handlePositionChange(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      markerRef.current = marker

      // Set initial address for the default center
      handlePositionChange(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    }

    initMap()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [isOpen])

  async function handleSearch(query: string) {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ma`,
        { headers: { Accept: "application/json" } },
      )
      const data = await res.json()
      setSearchResults(data || [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  function handleSelectSearchResult(result: { display_name: string; lat: string; lon: string }) {
    const lat = Number.parseFloat(result.lat)
    const lng = Number.parseFloat(result.lon)
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16)
      markerRef.current.setLatLng([lat, lng])
      setCoords({ lat, lng })
      setAddress(result.display_name)
    }
    setSearchResults([])
    setSearchQuery(result.display_name)
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([latitude, longitude], 15)
          markerRef.current.setLatLng([latitude, longitude])
          setCoords({ lat: latitude, lng: longitude })
          setLoadingAddress(true)
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            { headers: { Accept: "application/json" } },
          )
            .then((res) => res.json())
            .then((data) => setAddress(data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`))
            .catch(() => setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`))
            .finally(() => setLoadingAddress(false))
        }
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 },
    )
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-neutral-800">
          <h3 className="font-semibold flex items-center gap-2 dark:text-white">
            <MapPin className="w-4 h-4" /> Choisir ma localisation
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-black dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative px-5 pt-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              handleSearch(e.target.value)
            }}
            placeholder="Rechercher une ville, un quartier, une rue..."
            className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white dark:text-white"
          />
          {searching && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-8 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          {searchResults.length > 0 && (
            <div className="absolute left-5 right-5 top-full mt-1 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg z-[500] max-h-48 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 dark:text-white border-b border-gray-100 dark:border-neutral-800 last:border-0"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative mt-3">
          <div ref={mapContainerRef} className="w-full h-[26rem] z-0" />
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="absolute bottom-3 right-3 z-[400] bg-white dark:bg-neutral-900 shadow-lg rounded-full p-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800"
            title="Utiliser ma position actuelle"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin dark:text-white" />
            ) : (
              <Locate className="w-4 h-4 dark:text-white" />
            )}
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cliquez sur la carte ou déplacez le repère pour choisir l'adresse de livraison.
          </p>
          <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-2.5 text-sm min-h-[44px] flex items-center dark:text-white">
            {loadingAddress ? (
              <span className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recherche de l'adresse...
              </span>
            ) : (
              address || "Sélectionnez un emplacement sur la carte"
            )}
          </div>
          <Button
            className="w-full bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={!coords || loadingAddress}
            onClick={() => {
              if (coords) {
                onConfirm({ address, lat: coords.lat, lng: coords.lng })
                onClose()
              }
            }}
          >
            Confirmer cette adresse
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
