import { useState } from "react";
import { useDataProvider, useGetIdentity, useNotify } from "ra-core";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { Board, Sale } from "../../types";
import { StageBuilder, type StageData } from "./StageBuilder";
import { useConfigurationContext } from "../../root/ConfigurationContext";

interface BoardCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BoardFormData {
  name: string;
  description: string;
  stages: StageData[];
}

export const BoardCreateDialog = ({
  open,
  onOpenChange,
}: BoardCreateDialogProps) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { identity } = useGetIdentity<Sale>();
  const { refreshBoards, switchBoard } = useConfigurationContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BoardFormData>({
    defaultValues: {
      name: "",
      description: "",
      stages: [
        { value: "open", label: "Open", color: "#3b82f6", position: 1 },
        {
          value: "in-progress",
          label: "In Progress",
          color: "#f59e0b",
          position: 2,
        },
        { value: "closed", label: "Closed", color: "#22c55e", position: 3 },
      ],
    },
  });

  const stages = watch("stages");

  const onSubmit = async (data: BoardFormData) => {
    try {
      setIsSubmitting(true);

      // Validate stages
      if (data.stages.length === 0) {
        notify("Please add at least one stage", { type: "error" });
        return;
      }

      // Check for empty stage names
      const hasEmptyStages = data.stages.some((s) => !s.label || !s.value);
      if (hasEmptyStages) {
        notify("All stages must have a name and ID", { type: "error" });
        return;
      }

      // Check for duplicate stage values
      const stageValues = data.stages.map((s) => s.value);
      const hasDuplicates = stageValues.length !== new Set(stageValues).size;
      if (hasDuplicates) {
        notify("Stage IDs must be unique", { type: "error" });
        return;
      }

      // Get the next position for the board
      const { data: boards } = await dataProvider.getList<Board>("boards", {
        pagination: { page: 1, perPage: 1 },
        sort: { field: "position", order: "DESC" },
        filter: {},
      });

      const nextPosition =
        boards.length > 0 ? (boards[0].position || 0) + 1 : 1;

      // Create the board
      const { data: newBoard } = await dataProvider.create<Board>("boards", {
        data: {
          name: data.name,
          description: data.description || null,
          is_default: false,
          position: nextPosition,
          created_by: identity?.id,
        },
      });

      // Create stages for the board
      for (const stage of data.stages) {
        await dataProvider.create("board_stages", {
          data: {
            board_id: newBoard.id,
            value: stage.value,
            label: stage.label,
            color: stage.color,
            position: stage.position,
          },
        });
      }

      notify("Board created successfully", { type: "success" });

      // Refresh boards list and switch to new board
      refreshBoards();
      switchBoard(newBoard.id);

      // Reset form and close dialog
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating board:", error);
      notify("Failed to create board", { type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-oswald text-2xl uppercase tracking-wide font-bold text-slate-900">
            Create New Board
          </DialogTitle>
          <DialogDescription className="font-sans text-slate-600">
            Create a custom board with your own stages to organize deals in your
            workflow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Board Name */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="font-oswald uppercase text-base tracking-wide font-semibold text-slate-900"
            >
              Board Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name", { required: "Board name is required" })}
              placeholder="e.g., Franchisee Pipeline"
              disabled={isSubmitting}
              className="border-slate-200 focus:ring-2 focus:ring-blue-500 font-sans"
            />
            {errors.name && (
              <p className="font-sans text-sm text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Board Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="font-oswald uppercase text-base tracking-wide font-semibold text-slate-900"
            >
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of this board's purpose..."
              rows={3}
              disabled={isSubmitting}
              className="border-slate-200 focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Stage Builder */}
          <StageBuilder
            stages={stages}
            onChange={(newStages) => setValue("stages", newStages)}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="border-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-sans font-medium px-6 py-2.5 rounded-md transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-sans font-medium px-6 py-2.5 rounded-md transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Board...
                </>
              ) : (
                "Create Board"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
