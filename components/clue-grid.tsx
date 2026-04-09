"use client"

import { cn } from "@/lib/utils"
import type { ClueCell } from "@/lib/game-logic"
import { ArrowUp, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"

interface ClueGridProps {
  grid: ClueCell[][]
  playerName: string
  animationDelay?: number
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

export function ClueGrid({ grid, playerName, animationDelay = 0 }: ClueGridProps) {
  return (
    <div className="space-y-3">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: animationDelay }}
      >
        <span className="text-lg font-semibold text-foreground">{playerName}</span>
      </motion.div>
      <div className="grid grid-cols-3 gap-2">
        {grid.flat().map((cell, index) => (
          <motion.div
            key={index}
            initial={{ rotateY: 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: animationDelay + (index * 0.1),
              type: "spring",
              stiffness: 100
            }}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-lg min-h-[80px] transition-colors",
              getStatusClasses(cell.status)
            )}
            style={{ transformStyle: "preserve-3d" }}
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
                transition={{ delay: animationDelay + (index * 0.1) + 0.3 }}
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
