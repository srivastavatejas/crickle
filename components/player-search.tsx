"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { searchCricketers, type Cricketer } from "@/lib/cricketers"
import { Search } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface PlayerSearchProps {
  onGuess: (cricketer: Cricketer) => void
  disabled?: boolean
  guessedIds: string[]
}

export function PlayerSearch({ onGuess, disabled, guessedIds }: PlayerSearchProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Cricketer[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length >= 2) {
      const filtered = searchCricketers(query).filter(
        c => !guessedIds.includes(c.id)
      )
      setResults(filtered)
      setShowDropdown(filtered.length > 0)
      setSelectedIndex(0)
    } else {
      setResults([])
      setShowDropdown(false)
    }
  }, [query, guessedIds])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(cricketer: Cricketer) {
    onGuess(cricketer)
    setQuery("")
    setShowDropdown(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type a cricketer's name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            disabled={disabled}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          onClick={() => results[selectedIndex] && handleSelect(results[selectedIndex])}
          disabled={disabled || results.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Guess
        </Button>
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden"
          >
            {results.slice(0, 5).map((cricketer, index) => (
              <motion.button
                key={cricketer.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(cricketer)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-secondary/50 text-foreground"
                }`}
              >
                <span className="font-medium">{cricketer.name}</span>
                <span className="text-sm text-muted-foreground ml-2">
                  ({cricketer.nation})
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
