import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, Settings, BarChart3, Layers } from "lucide-react";
import { useGetIdentity } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Sale } from "../../types";
import { BoardList } from "./BoardList";
import { BoardAnalytics } from "./BoardAnalytics";

export const DealSidebar = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"boards" | "analytics">("boards");
  const { identity } = useGetIdentity<Sale>();
  const { currentBoard, boards } = useConfigurationContext();

  const isAdmin = identity?.administrator;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={2} />
          <span className="hidden sm:inline font-medium">
            {currentBoard?.name || "Boards"}
          </span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-96 bg-white p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="bg-slate-900 px-6 py-8 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-oswald uppercase text-2xl tracking-wide font-bold text-white">
              {currentBoard?.name || "Boards"}
            </SheetTitle>
            {isAdmin && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-slate-800 transition-colors"
                onClick={() => {
                  // TODO: Open board management dialog
                  console.log("Open board management");
                }}
              >
                <Settings className="w-4 h-4" strokeWidth={2} />
              </Button>
            )}
          </div>
          <p className="font-sans text-slate-300 text-sm">
            {view === "boards" ? "Switch between deal pipelines" : "Performance metrics and insights"}
          </p>
        </SheetHeader>

        {/* View Toggle */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setView("boards")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md
                font-sans text-sm font-medium transition-all
                ${
                  view === "boards"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <Layers className="w-4 h-4" strokeWidth={2} />
              Boards
            </button>
            <button
              onClick={() => setView("analytics")}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md
                font-sans text-sm font-medium transition-all
                ${
                  view === "analytics"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }
              `}
            >
              <BarChart3 className="w-4 h-4" strokeWidth={2} />
              Analytics
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === "boards" ? (
            <BoardList onBoardSelect={() => setOpen(false)} />
          ) : (
            <BoardAnalytics />
          )}
        </div>

        {/* Create Board Button (Admin Only, only in boards view) */}
        {isAdmin && view === "boards" && (
          <div className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium gap-2"
              onClick={() => {
                // TODO: Open create board dialog
                console.log("Create new board");
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Create Board
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
