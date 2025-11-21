import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useDataProvider } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import type { Identifier } from "ra-core";

import type { Board, BoardStage } from "../types";

const CURRENT_BOARD_KEY = "usprosthetix.currentBoardId";

interface BoardsContextValue {
  currentBoard: Board | null;
  boards: Board[];
  currentBoardStages: BoardStage[];
  boardsLoading: boolean;
  boardsError: Error | null;
  switchBoard: (boardId: Identifier) => void;
  refreshBoards: () => void;
}

const BoardsContext = createContext<BoardsContextValue>({
  currentBoard: null,
  boards: [],
  currentBoardStages: [],
  boardsLoading: false,
  boardsError: null,
  switchBoard: () => {},
  refreshBoards: () => {},
});

export const BoardsProvider = ({ children }: { children: ReactNode }) => {
  const dataProvider = useDataProvider();
  const [currentBoardId, setCurrentBoardId] = useState<Identifier | null>(() => {
    // Load last-used board from localStorage
    const stored = localStorage.getItem(CURRENT_BOARD_KEY);
    return stored ? Number(stored) : null;
  });

  // Fetch boards from database
  const {
    data: boardsData,
    isLoading: boardsLoading,
    error: boardsError,
    refetch: refetchBoards,
  } = useQuery({
    queryKey: ["boards", "getList"],
    queryFn: async () => {
      return await dataProvider.getList<Board>("boards", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "position", order: "ASC" },
        filter: {},
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const boards = boardsData?.data || [];

  // Determine current board (prioritize user selection, fallback to default)
  const currentBoard = useMemo(() => {
    if (boards.length === 0) return null;

    // Use selected board if valid
    if (currentBoardId) {
      const selected = boards.find((b) => b.id === currentBoardId);
      if (selected) return selected;
    }

    // Fallback to default board
    const defaultBoard = boards.find((b) => b.is_default);
    if (defaultBoard) return defaultBoard;

    // Fallback to first board
    return boards[0];
  }, [boards, currentBoardId]);

  // Fetch stages for current board
  const {
    data: stagesData,
    isLoading: stagesLoading,
    error: stagesError,
  } = useQuery({
    queryKey: ["board_stages", "getList", currentBoard?.id],
    queryFn: async () => {
      if (!currentBoard) return { data: [] };
      return await dataProvider.getList<BoardStage>("board_stages", {
        pagination: { page: 1, perPage: 100 },
        sort: { field: "position", order: "ASC" },
        filter: { board_id: currentBoard.id },
      });
    },
    enabled: !!currentBoard,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currentBoardStages = stagesData?.data || [];

  // Persist current board selection to localStorage
  useEffect(() => {
    if (currentBoard) {
      localStorage.setItem(CURRENT_BOARD_KEY, String(currentBoard.id));
    }
  }, [currentBoard]);

  const switchBoard = (boardId: Identifier) => {
    setCurrentBoardId(boardId);
  };

  const refreshBoards = () => {
    refetchBoards();
  };

  const value = useMemo(
    () => ({
      currentBoard,
      boards,
      currentBoardStages,
      boardsLoading: boardsLoading || stagesLoading,
      boardsError: (boardsError || stagesError) as Error | null,
      switchBoard,
      refreshBoards,
    }),
    [
      currentBoard,
      boards,
      currentBoardStages,
      boardsLoading,
      stagesLoading,
      boardsError,
      stagesError,
      refetchBoards,
    ]
  );

  return (
    <BoardsContext.Provider value={value}>
      {children}
    </BoardsContext.Provider>
  );
};

export const useBoardsContext = () => useContext(BoardsContext);
