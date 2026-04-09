"use client"

import { cn } from "@/lib/utils"
import type { ClueCell, RangeState } from "@/lib/game-logic"
import { ArrowUp, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"

interface SummaryGridProps {
  rangeState: RangeState
  bestValues: {
    debutYear: { value: number | null; status: ClueCell["status"]; comparison: "higher" | "lower" | null }
    nation: { value: string | null; status: ClueCell["status"] }
    intlMatches: { value: number | null; status: ClueCell["status"]; comparison: "higher" | "lower" | null }
    intlWickets: { value: number | null; status: ClueCell["status"]; comparison: "higher" | "lower" | null }
    playedWith: { teams: string[] }
    intlRuns: { value: number | null; status: ClueCell["status"]; comparison: "higher" | "lower" | null }
    battingHand: { value: string | null; status: ClueCell["status"] }
    bowlingType: { value: string | null; status: ClueCell["status"] }
    highScore: { value: number | null; status: ClueCell["status"]; comparison: "higher" | "lower" | null }
  }
}

function getStatusClasses(status: ClueCell["status"]) {
  switch (status) {
    case "correct":
      return "bg-game-correct text-foreground"
    case "close":
      return "bg-game-close text-foreground"
    case "wrong":
      return "bg-game-wrong text-foreground"
    default:
      return "bg-game-wrong text-foreground"
  }
}

function formatRange(
  range: { min: number | null; max: number | null; found: boolean },
  formatFn?: (n: number) => string
): string {
  const fmt = formatFn || ((n: number) => n.toString())
  
  if (range.found && range.min !== null) {
    return fmt(range.min)
  }
  
  if (range.min !== null && range.max !== null) {
    return `${fmt(range.min)}-${fmt(range.max)}`
  } else if (range.min !== null) {
    return `>${fmt(range.min)}`
  } else if (range.max !== null) {
    return `<${fmt(range.max)}`
  }
  
  return "?"
}

export function SummaryGrid({ rangeState, bestValues }: SummaryGridProps) {
  // Determine status for played with based on accumulated teams count
  const teamsCount = bestValues.playedWith.teams.length
  let playedWithStatus: ClueCell["status"] = "wrong"
  if (teamsCount >= 3) {
    playedWithStatus = "correct"
  } else if (teamsCount >= 1) {
    playedWithStatus = "close"
  }

  const cells = [
    {
      label: "Debut Year",
      value: formatRange(rangeState.debutYear),
      status: bestValues.debutYear.status,
      comparison: bestValues.debutYear.comparison
    },
    {
      label: "Nation",
      value: bestValues.nation.value || "?",
      status: bestValues.nation.status,
      comparison: null
    },
    {
      label: "Intl Matches",
      value: formatRange(rangeState.intlMatches),
      status: bestValues.intlMatches.status,
      comparison: bestValues.intlMatches.comparison
    },
    {
      label: "Intl Wickets",
      value: formatRange(rangeState.intlWickets),
      status: bestValues.intlWickets.status,
      comparison: bestValues.intlWickets.comparison
    },
    {
      label: "Played With",
      value: bestValues.playedWith.teams.length > 0 ? bestValues.playedWith.teams.join(", ") : "?",
      status: playedWithStatus,
      comparison: null
    },
    {
      label: "Intl Runs",
      value: formatRange(rangeState.intlRuns, (n) => n.toLocaleString()),
      status: bestValues.intlRuns.status,
      comparison: bestValues.intlRuns.comparison
    },
    {
      label: "Batting Hand",
      value: bestValues.battingHand.value || "?",
      status: bestValues.battingHand.status,
      comparison: null
    },
    {
      label: "Bowling Type",
      value: bestValues.bowlingType.value || "?",
      status: bestValues.bowlingType.status,
      comparison: null
    },
    {
      label: "High Score",
      value: formatRange(rangeState.highScore),
      status: bestValues.highScore.status,
      comparison: bestValues.highScore.comparison
    }
  ]

  return (
    <div className="space-y-3">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-lg font-semibold text-primary">GUESS SUMMARY</span>
        <p className="text-xs text-muted-foreground mt-1">Best clues from all guesses</p>
      </motion.div>
      <div className="grid grid-cols-3 gap-2">
        {cells.map((cell, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 200
            }}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-lg min-h-[80px] transition-colors border-2 border-foreground/10",
              getStatusClasses(cell.status)
            )}
          >
            <span className="text-xs font-medium opacity-80 text-center mb-1">
              {cell.label}
            </span>
            <span className="text-sm font-bold text-center leading-tight">
              {cell.value}
            </span>
            {cell.comparison && (
              <motion.div 
                className="absolute top-1 right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
              >
                {cell.comparison === "higher" ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
