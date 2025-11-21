import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type StageData = {
  value: string;
  label: string;
  color: string;
  position: number;
};

interface StageBuilderProps {
  stages: StageData[];
  onChange: (stages: StageData[]) => void;
}

const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#22c55e", // success green
  "#ef4444", // red
];

export const StageBuilder = ({ stages, onChange }: StageBuilderProps) => {
  const [errors, setErrors] = useState<Record<number, string>>({});

  const addStage = () => {
    const newPosition = stages.length + 1;
    const colorIndex = (stages.length) % DEFAULT_COLORS.length;

    onChange([
      ...stages,
      {
        value: "",
        label: "",
        color: DEFAULT_COLORS[colorIndex],
        position: newPosition,
      },
    ]);
  };

  const removeStage = (index: number) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    // Reindex positions
    const reindexed = updatedStages.map((stage, i) => ({
      ...stage,
      position: i + 1,
    }));
    onChange(reindexed);

    // Clear error for this index
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const moveStage = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === stages.length - 1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updatedStages = [...stages];
    [updatedStages[index], updatedStages[newIndex]] = [updatedStages[newIndex], updatedStages[index]];

    // Reindex positions
    const reindexed = updatedStages.map((stage, i) => ({
      ...stage,
      position: i + 1,
    }));
    onChange(reindexed);
  };

  const updateStage = (index: number, field: keyof StageData, value: string) => {
    const updatedStages = [...stages];
    updatedStages[index] = {
      ...updatedStages[index],
      [field]: value,
    };

    // Auto-generate value from label if label is being edited
    if (field === "label" && value) {
      const autoValue = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      updatedStages[index].value = autoValue;
    }

    // Validate value is URL-safe
    if (field === "value") {
      const isValid = /^[a-z0-9-_]+$/.test(value);
      const newErrors = { ...errors };
      if (!isValid && value) {
        newErrors[index] = "Only lowercase letters, numbers, hyphens, and underscores";
      } else {
        delete newErrors[index];
      }
      setErrors(newErrors);
    }

    onChange(updatedStages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="font-oswald uppercase text-base tracking-wide font-semibold text-slate-900">
            Pipeline Stages
          </Label>
          <p className="font-sans text-sm text-slate-600 mt-1">
            Define the stages for your board workflow
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addStage}
          className="gap-2 border-2 border-slate-200 hover:bg-slate-50 text-slate-900 font-sans font-medium transition-colors"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Add Stage
        </Button>
      </div>

      {stages.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center bg-slate-50">
          <p className="font-sans text-slate-600">No stages yet. Add your first stage to get started.</p>
          <Button
            type="button"
            onClick={addStage}
            className="mt-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white font-sans font-medium px-6 py-2.5 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Add First Stage
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {stages.map((stage, index) => (
            <div
              key={index}
              className="border border-slate-200 rounded-lg p-4 bg-white hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                {/* Drag handle (visual only for now) */}
                <div className="flex flex-col gap-1 pt-2">
                  <GripVertical className="w-4 h-4 text-slate-400" />
                </div>

                {/* Stage inputs */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`stage-label-${index}`} className="font-sans text-sm font-medium text-slate-900">
                        Stage Name
                      </Label>
                      <Input
                        id={`stage-label-${index}`}
                        value={stage.label}
                        onChange={(e) => updateStage(index, "label", e.target.value)}
                        placeholder="e.g., Inquiry"
                        className="mt-1 border-slate-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`stage-value-${index}`} className="font-sans text-sm font-medium text-slate-900">
                        Stage ID
                      </Label>
                      <Input
                        id={`stage-value-${index}`}
                        value={stage.value}
                        onChange={(e) => updateStage(index, "value", e.target.value)}
                        placeholder="e.g., inquiry"
                        className="mt-1 border-slate-200 focus:ring-2 focus:ring-blue-500"
                      />
                      {errors[index] && (
                        <p className="font-sans text-xs text-red-500 mt-1">{errors[index]}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`stage-color-${index}`} className="font-sans text-sm font-medium text-slate-900">
                      Stage Color
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id={`stage-color-${index}`}
                        type="color"
                        value={stage.color}
                        onChange={(e) => updateStage(index, "color", e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <div className="flex gap-1">
                        {DEFAULT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateStage(index, "color", color)}
                            className="w-8 h-8 rounded border-2 border-slate-200 hover:border-slate-400 transition-colors"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStage(index, "up")}
                    disabled={index === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => moveStage(index, "down")}
                    disabled={index === stages.length - 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStage(index)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {stages.length > 0 && (
        <p className="font-sans text-xs text-slate-600">
          Tip: Stage IDs are auto-generated from stage names. They must be unique and URL-safe.
        </p>
      )}
    </div>
  );
};
