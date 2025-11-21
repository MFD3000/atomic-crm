import { useDataProvider } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle } from "lucide-react";
import type { Identifier } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Deal } from "../../types";

interface BoardListProps {
  onBoardSelect?: () => void;
}

export const BoardList = ({ onBoardSelect }: BoardListProps) => {
  const dataProvider = useDataProvider();
  const { currentBoard, boards, boardsLoading, switchBoard } = useConfigurationContext();

  // Fetch deal counts per board
  const { data: dealsData } = useQuery({
    queryKey: ["deals", "getList", "board-counts"],
    queryFn: async () => {
      return await dataProvider.getList<Deal>("deals", {
        pagination: { page: 1, perPage: 1000 },
        sort: { field: "id", order: "ASC" },
        filter: { "archived_at@is": null },
      });
    },
  });

  const deals = dealsData?.data || [];

  // Calculate deal counts per board
  const dealCounts = boards.reduce(
    (acc, board) => {
      acc[board.id] = deals.filter((d) => d.board_id === board.id).length;
      return acc;
    },
    {} as Record<Identifier, number>
  );

  const handleBoardClick = (boardId: Identifier) => {
    switchBoard(boardId);
    onBoardSelect?.();
  };

  if (boardsLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-slate-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="font-sans text-slate-500 text-sm">
          No boards available
        </p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-300px)] overflow-y-auto">
      <div className="space-y-2">
        {boards.map((board) => {
          const isActive = currentBoard?.id === board.id;
          const dealCount = dealCounts[board.id] || 0;

          return (
            <button
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className={`
                w-full text-left p-4 rounded-lg
                border-2 transition-all duration-200
                ${
                  isActive
                    ? "border-blue-600 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }
              `}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isActive ? (
                      <CheckCircle2
                        className="w-5 h-5 text-blue-600 flex-shrink-0"
                        strokeWidth={2}
                      />
                    ) : (
                      <Circle
                        className="w-5 h-5 text-slate-300 flex-shrink-0"
                        strokeWidth={2}
                      />
                    )}
                    <h3
                      className={`
                        font-oswald uppercase text-sm tracking-wide font-semibold
                        truncate
                        ${isActive ? "text-blue-900" : "text-slate-900"}
                      `}
                    >
                      {board.name}
                    </h3>
                  </div>

                  {board.description && (
                    <p
                      className={`
                        font-sans text-xs truncate ml-7
                        ${isActive ? "text-blue-700" : "text-slate-500"}
                      `}
                    >
                      {board.description}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  <span
                    className={`
                      inline-flex items-center justify-center
                      w-10 h-10 rounded-full
                      font-oswald text-sm font-bold
                      ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }
                    `}
                  >
                    {dealCount}
                  </span>
                </div>
              </div>

              {board.is_default && (
                <div className="mt-2 ml-7">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                    Default
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
