// Mine Sweeper Brightness Game
// Click safe squares to increase brightness, hit a mine and lose everything

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MinigameProps } from '../types/Minigame';

const GRID_SIZE = 5;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const MIN_BRIGHTNESS = 0.05;

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_CONFIG: Record<Difficulty, { mines: number; label: string }> = {
  easy: { mines: 4, label: 'Easy (4 mines)' },
  medium: { mines: 6, label: 'Medium (6 mines)' },
  hard: { mines: 9, label: 'Hard (9 mines)' },
};

type CellState = 'hidden' | 'revealed' | 'mine';

interface Cell {
  index: number;
  hasMine: boolean;
  state: CellState;
}

function generateMineField(numMines: number): Cell[] {
  const cells: Cell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
    index: i,
    hasMine: false,
    state: 'hidden' as CellState,
  }));

  // Randomly place mines
  const mineIndices = new Set<number>();
  while (mineIndices.size < numMines) {
    const randomIndex = Math.floor(Math.random() * TOTAL_CELLS);
    mineIndices.add(randomIndex);
  }

  mineIndices.forEach((idx) => {
    cells[idx].hasMine = true;
  });

  return cells;
}

export default function MinesGame({ onBrightnessChange, onExit }: MinigameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [cells, setCells] = useState<Cell[]>(() => generateMineField(DIFFICULTY_CONFIG[difficulty].mines));
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const numMines = DIFFICULTY_CONFIG[difficulty].mines;
  const safeRevealed = useMemo(
    () => cells.filter((c) => c.state === 'revealed' && !c.hasMine).length,
    [cells]
  );

  const totalSafeCells = TOTAL_CELLS - numMines;
  const brightness = useMemo(
    () => MIN_BRIGHTNESS + (safeRevealed / totalSafeCells) * (1 - MIN_BRIGHTNESS),
    [safeRevealed, totalSafeCells]
  );

  useEffect(() => {
    if (gameStarted) {
      onBrightnessChange(brightness);
    }
  }, [brightness, onBrightnessChange, gameStarted]);

  const handleCellClick = (index: number) => {
    if (gameOver) return;
    const cell = cells[index];
    if (cell.state !== 'hidden') return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    const newCells = [...cells];
    newCells[index] = { ...cell, state: cell.hasMine ? 'mine' : 'revealed' };

    if (cell.hasMine) {
      // Reveal all remaining hidden mines
      newCells.forEach((c, i) => {
        if (c.hasMine && c.state === 'hidden') {
          newCells[i] = { ...c, state: 'mine' };
        }
      });
      setCells(newCells);
      setGameOver(true);
      onBrightnessChange(MIN_BRIGHTNESS);
      setTimeout(() => onExit(), 1200);
    } else {
      setCells(newCells);
    }
  };

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setCells(generateMineField(DIFFICULTY_CONFIG[newDifficulty].mines));
    setGameOver(false);
    setGameStarted(false);
  };

  const handleReset = () => {
    setCells(generateMineField(numMines));
    setGameOver(false);
    setGameStarted(false);
  };

  const allSafeRevealed = safeRevealed === totalSafeCells;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mine Sweeper</Text>
        <Text style={styles.stats}>
          {safeRevealed}/{totalSafeCells}
        </Text>
      </View>

      <View style={styles.difficultyRow}>
        {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((diff) => (
          <TouchableOpacity
            key={diff}
            onPress={() => handleDifficultyChange(diff)}
            style={[styles.difficultyChip, difficulty === diff && styles.difficultyChipActive]}
            disabled={gameStarted && !gameOver}
          >
            <Text style={[styles.difficultyText, difficulty === diff && styles.difficultyTextActive]}>
              {DIFFICULTY_CONFIG[diff].label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoText}>💡 {Math.round(brightness * 100)}% brightness</Text>
        <Text style={styles.hint}>
          {gameOver
            ? '💥 Hit a mine! Brightness reset.'
            : allSafeRevealed
            ? '🎉 All safe cells revealed!'
            : !gameStarted
            ? 'Select difficulty and start clicking!'
            : `${numMines} mines hidden. Click carefully!`}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {Array.from({ length: GRID_SIZE }).map((_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: GRID_SIZE }).map((_, col) => {
              const index = row * GRID_SIZE + col;
              const cell = cells[index];
              const isRevealed = cell.state === 'revealed' || cell.state === 'mine';
              const isMine = cell.state === 'mine';
              const isSafe = cell.state === 'revealed' && !cell.hasMine;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cell,
                    isRevealed && styles.cellRevealed,
                    isMine && styles.cellMine,
                    isSafe && styles.cellSafe,
                  ]}
                  onPress={() => handleCellClick(index)}
                  disabled={isRevealed || gameOver}
                >
                  <Text style={styles.cellText}>
                    {isMine ? '💣' : isSafe ? '✓' : '?'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>New Game</Text>
        </TouchableOpacity>
        {allSafeRevealed && !gameOver && (
          <TouchableOpacity
            onPress={onExit}
            style={[styles.resetButton, styles.finishButton]}
          >
            <Text style={styles.resetButtonText}>Finish & Keep Brightness</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1f2b4a',
    borderRadius: 8,
  },
  exitText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  stats: {
    color: '#ffd54f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  difficultyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1f2b4a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#23345f',
  },
  difficultyChipActive: {
    backgroundColor: '#ffd54f',
    borderColor: '#ffd54f',
  },
  difficultyText: {
    color: '#b7c8e8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  difficultyTextActive: {
    color: '#0f0f23',
  },
  infoCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#23345f',
  },
  infoText: {
    color: '#7bed8d',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    color: '#b7c8e8',
    fontSize: 14,
    textAlign: 'center',
  },
  gridContainer: {
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 60,
    height: 60,
    backgroundColor: '#1f2b4a',
    borderWidth: 1,
    borderColor: '#0f0f23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellRevealed: {
    backgroundColor: '#121a33',
  },
  cellMine: {
    backgroundColor: '#8b0000',
  },
  cellSafe: {
    backgroundColor: '#1a5c3a',
  },
  cellText: {
    fontSize: 24,
    color: '#fff',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#ffd54f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 10,
  },
  finishButton: {
    backgroundColor: '#7bed8d',
  },
  resetButtonText: {
    color: '#0f0f23',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
