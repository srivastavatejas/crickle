"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayerSearch } from "./player-search"
import { ClueGrid } from "./clue-grid"
import { SummaryGrid } from "./summary-grid"
import { getRandomCricketer, type Cricketer } from "@/lib/cricketers"
import {
  evaluateGuess,
  createInitialRangeState,
  createInitialBestValues,
  type GuessResult,
  type RangeState,
  type BestValues
} from "@/lib/game-logic"
import { Trophy, RotateCcw, HelpCircle, X, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const MAX_ATTEMPTS = 10

export function CrickleGame() {
  const [target, setTarget] = useState<Cricketer | null>(null)
  const [guesses, setGuesses] = useState<GuessResult[]>([])
  const [rangeState, setRangeState] = useState<RangeState>(createInitialRangeState())
  const [bestValues, setBestValues] = useState<BestValues>(createInitialBestValues())
  const [gameWon, setGameWon] = useState(false)
  const [gameLost, setGameLost] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [viewingGuessIndex, setViewingGuessIndex] = useState<number | null>(null)

  useEffect(() => {
    setTarget(getRandomCricketer())
  }, [])

  function handleGuess(cricketer: Cricketer) {
    if (!target || gameWon || gameLost) return

    const { result, newRangeState, newBestValues } = evaluateGuess(cricketer, target, rangeState, bestValues)
    setRangeState(newRangeState)
    setBestValues(newBestValues)
    setGuesses(prev => [result, ...prev])
    setViewingGuessIndex(null) // Reset to show latest guess

    if (result.isCorrect) {
      setGameWon(true)
    } else if (guesses.length + 1 >= MAX_ATTEMPTS) {
      setGameLost(true)
    }
  }

  function resetGame() {
    setTarget(getRandomCricketer())
    setGuesses([])
    setRangeState(createInitialRangeState())
    setBestValues(createInitialBestValues())
    setGameWon(false)
    setGameLost(false)
    setViewingGuessIndex(null)
  }

  function navigatePrevious() {
    if (viewingGuessIndex === null) {
      // Currently viewing newest, go to index 1 (second newest)
      if (guesses.length > 1) setViewingGuessIndex(1)
    } else if (viewingGuessIndex < guesses.length - 1) {
      setViewingGuessIndex(viewingGuessIndex + 1)
    }
  }

  function navigateNext() {
    if (viewingGuessIndex === null) return
    if (viewingGuessIndex === 0) {
      setViewingGuessIndex(null) // Go back to newest
    } else {
      setViewingGuessIndex(viewingGuessIndex - 1)
    }
  }

  const guessedIds = guesses.map(g => g.cricketer.id)
  const attemptsLeft = MAX_ATTEMPTS - guesses.length
  const currentGuess = viewingGuessIndex === null ? guesses[0] : guesses[viewingGuessIndex]
  const guessNumber = viewingGuessIndex === null ? guesses.length : guesses.length - viewingGuessIndex
  const canNavigatePrev = guesses.length > 1 && (viewingGuessIndex === null ? true : viewingGuessIndex < guesses.length - 1)
  const canNavigateNext = viewingGuessIndex !== null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Crickle</h1>
              <p className="text-xs text-muted-foreground">
                Practice Mode
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowRules(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={resetGame}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Game Won State */}
        <AnimatePresence>
          {gameWon && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="bg-primary/10 border-primary/20 p-6 mb-8 text-center">
                <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Congratulations!
                </h2>
                <p className="text-muted-foreground mb-4">
                  You found <span className="text-primary font-semibold">{target?.name}</span> in{" "}
                  {guesses.length} {guesses.length === 1 ? "guess" : "guesses"}!
                </p>
                <Button onClick={resetGame} className="bg-primary text-primary-foreground">
                  Play Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Lost State */}
        <AnimatePresence>
          {gameLost && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Card className="bg-destructive/10 border-destructive/20 p-6 mb-8 text-center">
                <X className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Game Over
                </h2>
                <p className="text-muted-foreground mb-4">
                  The answer was <span className="text-destructive font-semibold">{target?.name}</span>
                </p>
                <Button onClick={resetGame} variant="destructive">
                  Try Again
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Input */}
        {!gameWon && !gameLost && (
          <div className="mb-8">
            <div className="text-center mb-6">
              <p className="text-muted-foreground">
                Guess the mystery cricketer!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Attempts remaining: <span className="font-semibold text-foreground">{attemptsLeft}</span> / {MAX_ATTEMPTS}
              </p>
            </div>
            <PlayerSearch
              onGuess={handleGuess}
              disabled={gameWon || gameLost}
              guessedIds={guessedIds}
            />
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-game-correct" />
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-game-close" />
            <span className="text-xs text-muted-foreground">Close</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-game-wrong" />
            <span className="text-xs text-muted-foreground">Wrong</span>
          </div>
        </div>

        {/* Grids Container */}
        {guesses.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Current Guess Grid with Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border p-4">
                {/* Navigation Header */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigatePrevious}
                    disabled={!canNavigatePrev}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Guess {guessNumber} of {guesses.length}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={navigateNext}
                    disabled={!canNavigateNext}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                {/* Guess Grid */}
                <AnimatePresence mode="wait">
                  {currentGuess && (
                    <motion.div
                      key={currentGuess.cricketer.id + guessNumber}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ClueGrid
                        grid={currentGuess.grid}
                        playerName={currentGuess.cricketer.name}
                        animationDelay={0}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>

            {/* Summary Grid */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="bg-card border-border border-primary/30 p-4">
                <SummaryGrid
                  rangeState={rangeState}
                  bestValues={bestValues}
                />
              </Card>
            </motion.div>
          </div>
        )}

        {/* Guess History Pills */}
        {guesses.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <Card className="bg-secondary/30 border-border p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Guess History</h3>
              <div className="flex flex-wrap gap-2">
                {guesses.map((guess, index) => {
                  const num = guesses.length - index
                  const isViewing = viewingGuessIndex === null ? index === 0 : viewingGuessIndex === index
                  return (
                    <button
                      key={guess.cricketer.id + index}
                      onClick={() => setViewingGuessIndex(index === 0 ? null : index)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isViewing
                        ? "bg-primary text-primary-foreground"
                        : guess.isCorrect
                          ? "bg-game-correct/20 text-foreground hover:bg-game-correct/30"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                    >
                      #{num} {guess.cricketer.name.split(" ")[0]}
                    </button>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {guesses.length === 0 && !gameWon && !gameLost && (
          <Card className="bg-card/50 border-border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              Start typing a cricketer&apos;s name to make your first guess
            </p>
          </Card>
        )}
      </main>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <Card className="bg-card border-border max-w-md w-full max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">How It Works</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowRules(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                      1. Try to guess the mystery cricketer in {MAX_ATTEMPTS} attempts!
                    </p>
                    <p>
                      2. Type a name and submit your guess.
                    </p>
                    <p>
                      3. A 3x3 grid reveals color-coded clues comparing your guess to the target:
                    </p>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                      <li><span className="text-primary font-medium">Green</span> = exact match (or 3+ common teams for Played With)</li>
                      <li><span className="text-accent font-medium">Amber</span> = close (same continent for nation, or 1-2 common teams)</li>
                      <li><span className="text-destructive font-medium">Red</span> = wrong (no common teams for Played With)</li>
                    </ul>
                    <p>
                      4. <strong>Played With</strong> shows the teams where your guess and the target have both played. If they share no common teams, it shows 2 of the guessed player&apos;s teams.
                    </p>
                    <p>
                      5. The <strong>GUESS SUMMARY</strong> grid accumulates all common teams found across your guesses.
                    </p>
                    <p>
                      6. Use the arrow buttons to navigate through your previous guesses.
                    </p>
                    <div className="pt-4 border-t border-border">
                      <p className="font-medium text-foreground mb-2">Grid Categories:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-center">
                        <div className="bg-secondary rounded p-2">Debut Year</div>
                        <div className="bg-secondary rounded p-2">Nation</div>
                        <div className="bg-secondary rounded p-2">Intl Matches</div>
                        <div className="bg-secondary rounded p-2">Intl Wickets</div>
                        <div className="bg-secondary rounded p-2">Played With</div>
                        <div className="bg-secondary rounded p-2">Intl Runs</div>
                        <div className="bg-secondary rounded p-2">Batting Hand</div>
                        <div className="bg-secondary rounded p-2">Bowling Type</div>
                        <div className="bg-secondary rounded p-2">High Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
