import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type BoardThemeId = 'green' | 'brown' | 'blue' | 'gray';
export type PieceStyleId = 'classic' | 'silhouette';

export interface BoardTheme {
    id: BoardThemeId;
    name: string;
    light: string;
    dark: string;
}

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
    green: { id: 'green', name: 'Green', light: '#EEEED2', dark: '#769656' },
    brown: { id: 'brown', name: 'Brown', light: '#F0D9B5', dark: '#B58863' },
    blue: { id: 'blue', name: 'Blue', light: '#DEE3E6', dark: '#8CA2AD' },
    gray: { id: 'gray', name: 'Gray', light: '#E0E0E0', dark: '#808080' },
};

interface GameThemeContextType {
    boardThemeId: BoardThemeId;
    pieceStyleId: PieceStyleId;
    setBoardTheme: (id: BoardThemeId) => void;
    setPieceStyle: (id: PieceStyleId) => void;
    currentBoardTheme: BoardTheme;
}

const GameThemeContext = createContext<GameThemeContextType | undefined>(undefined);

export function GameThemeProvider({ children }: { children: React.ReactNode }) {
    const [boardThemeId, setBoardThemeId] = useState<BoardThemeId>('green');
    const [pieceStyleId, setPieceStyleId] = useState<PieceStyleId>('classic');

    useEffect(() => {
        // Load saved theme
        AsyncStorage.getItem('game_theme').then((saved) => {
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.boardThemeId) setBoardThemeId(parsed.boardThemeId);
                if (parsed.pieceStyleId) setPieceStyleId(parsed.pieceStyleId);
            }
        });
    }, []);

    const setBoardTheme = (id: BoardThemeId) => {
        setBoardThemeId(id);
        AsyncStorage.setItem('game_theme', JSON.stringify({ boardThemeId: id, pieceStyleId }));
    };

    const setPieceStyle = (id: PieceStyleId) => {
        setPieceStyleId(id);
        AsyncStorage.setItem('game_theme', JSON.stringify({ boardThemeId, pieceStyleId: id }));
    };

    const value = {
        boardThemeId,
        pieceStyleId,
        setBoardTheme,
        setPieceStyle,
        currentBoardTheme: BOARD_THEMES[boardThemeId],
    };

    return (
        <GameThemeContext.Provider value={value}>
            {children}
        </GameThemeContext.Provider>
    );
}

export function useGameTheme() {
    const context = useContext(GameThemeContext);
    if (context === undefined) {
        throw new Error('useGameTheme must be used within a GameThemeProvider');
    }
    return context;
}
