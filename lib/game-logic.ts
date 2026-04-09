import { type Cricketer, getCommonTeams, getPlayerTeams } from "./cricketers"

export type ClueStatus = "correct" | "close" | "wrong"

export interface ClueCell {
  label: string
  value: string
  displayValue?: string
  status: ClueStatus
  comparison?: "higher" | "lower" | null
  teams?: string[]
}

export interface RangeState {
  debutYear: { min: number | null; max: number | null; found: boolean }
  intlMatches: { min: number | null; max: number | null; found: boolean }
  intlWickets: { min: number | null; max: number | null; found: boolean }
  intlRuns: { min: number | null; max: number | null; found: boolean }
  highScore: { min: number | null; max: number | null; found: boolean }
}

export interface GuessResult {
  cricketer: Cricketer
  grid: ClueCell[][]
  isCorrect: boolean
}

export interface BestValues {
  debutYear: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null }
  nation: { value: string | null; status: ClueStatus }
  intlMatches: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null }
  intlWickets: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null }
  playedWith: { teams: string[] }
  intlRuns: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null }
  battingHand: { value: string | null; status: ClueStatus }
  bowlingType: { value: string | null; status: ClueStatus }
  highScore: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null }
}

export function createInitialBestValues(): BestValues {
  return {
    debutYear: { value: null, status: "wrong", comparison: null },
    nation: { value: null, status: "wrong" },
    intlMatches: { value: null, status: "wrong", comparison: null },
    intlWickets: { value: null, status: "wrong", comparison: null },
    playedWith: { teams: [] },
    intlRuns: { value: null, status: "wrong", comparison: null },
    battingHand: { value: null, status: "wrong" },
    bowlingType: { value: null, status: "wrong" },
    highScore: { value: null, status: "wrong", comparison: null }
  }
}

export function createInitialRangeState(): RangeState {
  return {
    debutYear: { min: null, max: null, found: false },
    intlMatches: { min: null, max: null, found: false },
    intlWickets: { min: null, max: null, found: false },
    intlRuns: { min: null, max: null, found: false },
    highScore: { min: null, max: null, found: false }
  }
}

function updateRange(
  range: { min: number | null; max: number | null; found: boolean },
  guessedValue: number,
  targetValue: number
): { min: number | null; max: number | null; found: boolean } {
  if (guessedValue === targetValue) {
    return { min: targetValue, max: targetValue, found: true }
  }
  
  const newRange = { ...range }
  
  if (guessedValue < targetValue) {
    // Guessed too low - update lower bound
    if (newRange.min === null || guessedValue > newRange.min) {
      newRange.min = guessedValue
    }
  } else {
    // Guessed too high - update upper bound
    if (newRange.max === null || guessedValue < newRange.max) {
      newRange.max = guessedValue
    }
  }
  
  return newRange
}

function formatRangeDisplay(
  range: { min: number | null; max: number | null; found: boolean },
  currentValue: number,
  formatFn?: (n: number) => string
): string {
  const fmt = formatFn || ((n: number) => n.toString())
  
  if (range.found) {
    return fmt(currentValue)
  }
  
  if (range.min !== null && range.max !== null) {
    return `${fmt(range.min)}-${fmt(range.max)}`
  } else if (range.min !== null) {
    return `>${fmt(range.min)}`
  } else if (range.max !== null) {
    return `<${fmt(range.max)}`
  }
  
  return fmt(currentValue)
}

function compareNumber(
  guessed: number,
  target: number
): { status: ClueStatus; comparison: "higher" | "lower" | null } {
  if (guessed === target) {
    return { status: "correct", comparison: null }
  }
  return { status: "wrong", comparison: guessed < target ? "higher" : "lower" }
}

function compareNation(guessedNation: string, guessedContinent: string, targetNation: string, targetContinent: string): ClueStatus {
  if (guessedNation.toLowerCase() === targetNation.toLowerCase()) {
    return "correct"
  }
  if (guessedContinent.toLowerCase() === targetContinent.toLowerCase()) {
    return "close"
  }
  return "wrong"
}

function compareText(guessed: string, target: string): ClueStatus {
  if (guessed.toLowerCase() === target.toLowerCase()) {
    return "correct"
  }
  return "wrong"
}

// Status priority: correct > close > wrong
function getStatusPriority(status: ClueStatus): number {
  switch (status) {
    case "correct": return 2
    case "close": return 1
    case "wrong": return 0
  }
}

function updateBestNumeric(
  current: { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null },
  newValue: number,
  newStatus: ClueStatus,
  newComparison: "higher" | "lower" | null
): { value: number | null; status: ClueStatus; comparison: "higher" | "lower" | null } {
  if (getStatusPriority(newStatus) > getStatusPriority(current.status)) {
    return { value: newValue, status: newStatus, comparison: newComparison }
  }
  return current
}

function updateBestText(
  current: { value: string | null; status: ClueStatus },
  newValue: string,
  newStatus: ClueStatus
): { value: string | null; status: ClueStatus } {
  if (getStatusPriority(newStatus) > getStatusPriority(current.status)) {
    return { value: newValue, status: newStatus }
  }
  return current
}

export function evaluateGuess(
  guessed: Cricketer,
  target: Cricketer,
  rangeState: RangeState,
  bestValues: BestValues
): { result: GuessResult; newRangeState: RangeState; newBestValues: BestValues } {
  const isCorrect = guessed.id === target.id
  
  // Update range state
  const newRangeState: RangeState = {
    debutYear: updateRange(rangeState.debutYear, guessed.debutYear, target.debutYear),
    intlMatches: updateRange(rangeState.intlMatches, guessed.intlMatches, target.intlMatches),
    intlWickets: updateRange(rangeState.intlWickets, guessed.intlWickets, target.intlWickets),
    intlRuns: updateRange(rangeState.intlRuns, guessed.intlRuns, target.intlRuns),
    highScore: updateRange(rangeState.highScore, guessed.highScore, target.highScore)
  }

  // Row 1: Debut Year, Nation, Intl Matches
  const debutYearResult = compareNumber(guessed.debutYear, target.debutYear)
  const nationResult = compareNation(guessed.nation, guessed.continent, target.nation, target.continent)
  const matchesResult = compareNumber(guessed.intlMatches, target.intlMatches)

  // Row 2: Intl Wickets, Played With (center pivot), Intl Runs
  const wicketsResult = compareNumber(guessed.intlWickets, target.intlWickets)
  const commonTeams = getCommonTeams(guessed.id, target.id)
  const guessedPlayerTeams = getPlayerTeams(guessed.id, 2)
  const runsResult = compareNumber(guessed.intlRuns, target.intlRuns)
  
  // Determine pivot status based on common teams count
  // Green (correct): 3+ common teams, Yellow (close): 1-2 common teams, Red (wrong): 0 common teams
  let playedWithStatus: ClueStatus = "wrong"
  if (commonTeams.length >= 3) {
    playedWithStatus = "correct"
  } else if (commonTeams.length >= 1) {
    playedWithStatus = "close"
  }

  // Row 3: Batting Hand, Bowling Type, High Score
  const battingHandResult = compareText(guessed.battingHand, target.battingHand)
  const bowlingTypeResult = compareText(guessed.bowlingType, target.bowlingType)
  const highScoreResult = compareNumber(guessed.highScore, target.highScore)

  // Determine nation display value - show continent in brackets when only continent matches
  const nationDisplayValue = nationResult === "close" 
    ? `${guessed.nation} (${guessed.continent})`
    : guessed.nation

  const grid: ClueCell[][] = [
    [
      {
        label: "Debut Year",
        value: guessed.debutYear.toString(),
        displayValue: formatRangeDisplay(newRangeState.debutYear, guessed.debutYear),
        status: debutYearResult.status,
        comparison: debutYearResult.comparison
      },
      {
        label: "Nation",
        value: nationDisplayValue,
        status: nationResult,
        comparison: null
      },
      {
        label: "Intl Matches",
        value: guessed.intlMatches.toString(),
        displayValue: formatRangeDisplay(newRangeState.intlMatches, guessed.intlMatches),
        status: matchesResult.status,
        comparison: matchesResult.comparison
      }
    ],
    [
      {
        label: "Intl Wickets",
        value: guessed.intlWickets.toString(),
        displayValue: formatRangeDisplay(newRangeState.intlWickets, guessed.intlWickets),
        status: wicketsResult.status,
        comparison: wicketsResult.comparison
      },
      {
        label: "Played With",
        value: commonTeams.length > 0 ? commonTeams.join(", ") : guessedPlayerTeams.join(", "),
        displayValue: commonTeams.length > 0 ? commonTeams.join(", ") : guessedPlayerTeams.join(", "),
        status: playedWithStatus,
        comparison: null,
        teams: commonTeams.length > 0 ? commonTeams : guessedPlayerTeams
      },
      {
        label: "Intl Runs",
        value: guessed.intlRuns.toLocaleString(),
        displayValue: formatRangeDisplay(newRangeState.intlRuns, guessed.intlRuns, (n) => n.toLocaleString()),
        status: runsResult.status,
        comparison: runsResult.comparison
      }
    ],
    [
      {
        label: "Batting Hand",
        value: guessed.battingHand,
        status: battingHandResult,
        comparison: null
      },
      {
        label: "Bowling Type",
        value: guessed.bowlingType,
        status: bowlingTypeResult,
        comparison: null
      },
      {
        label: "High Score",
        value: guessed.highScore.toString(),
        displayValue: formatRangeDisplay(newRangeState.highScore, guessed.highScore),
        status: highScoreResult.status,
        comparison: highScoreResult.comparison
      }
    ]
  ]

  // Accumulate unique common teams across all guesses
  const existingTeams = new Set(bestValues.playedWith.teams)
  commonTeams.forEach(team => existingTeams.add(team))
  const accumulatedTeams = Array.from(existingTeams)

  // Update best values
  const newBestValues: BestValues = {
    debutYear: updateBestNumeric(bestValues.debutYear, guessed.debutYear, debutYearResult.status, debutYearResult.comparison),
    nation: updateBestText(bestValues.nation, nationDisplayValue, nationResult),
    intlMatches: updateBestNumeric(bestValues.intlMatches, guessed.intlMatches, matchesResult.status, matchesResult.comparison),
    intlWickets: updateBestNumeric(bestValues.intlWickets, guessed.intlWickets, wicketsResult.status, wicketsResult.comparison),
    playedWith: { teams: accumulatedTeams },
    intlRuns: updateBestNumeric(bestValues.intlRuns, guessed.intlRuns, runsResult.status, runsResult.comparison),
    battingHand: updateBestText(bestValues.battingHand, guessed.battingHand, battingHandResult),
    bowlingType: updateBestText(bestValues.bowlingType, guessed.bowlingType, bowlingTypeResult),
    highScore: updateBestNumeric(bestValues.highScore, guessed.highScore, highScoreResult.status, highScoreResult.comparison)
  }

  return { 
    result: { cricketer: guessed, grid, isCorrect },
    newRangeState,
    newBestValues
  }
}
