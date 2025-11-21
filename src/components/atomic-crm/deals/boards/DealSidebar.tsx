import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Plus, BarChart3, Layers } from "lucide-react";
import { useGetIdentity } from "ra-core";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { Sale } from "../../types";
import { BoardList } from "./BoardList";
import { BoardAnalytics } from "./BoardAnalytics";
import { BoardCreateDialog } from "./BoardCreateDialog";

export const DealSidebar = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"boards" | "analytics">("boards");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { identity } = useGetIdentity<Sale>();
  const { currentBoard, boards } = useConfigurationContext();

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
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-slate-800 transition-colors gap-2"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="font-sans text-sm">New Board</span>
            </Button>
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
      </SheetContent>

      {/* Board Create Dialog */}
      <BoardCreateDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </Sheet>
  );
};
