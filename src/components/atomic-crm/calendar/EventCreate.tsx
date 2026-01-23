import { useForm } from "react-hook-form";
import { useDataProvider, useGetIdentity, useNotify } from "ra-core";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Event, EventType, Sale } from "../types";
import { useState } from "react";

interface EventCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date | null;
  onSuccess: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  location: string;
}

export const EventCreate = ({
  open,
  onOpenChange,
  selectedDate,
  onSuccess,
}: EventCreateProps) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const { identity } = useGetIdentity<Sale>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultDate = selectedDate || new Date();
  const dateStr = defaultDate.toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: "",
      description: "",
      event_type: "meeting",
      start_date: dateStr,
      start_time: "09:00",
      end_date: dateStr,
      end_time: "10:00",
      all_day: false,
      location: "",
    },
  });

  const allDay = watch("all_day");
  const eventType = watch("event_type");

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);

      const start_datetime = data.all_day
        ? `${data.start_date}T00:00:00Z`
        : `${data.start_date}T${data.start_time}:00Z`;

      const end_datetime =
        data.all_day || !data.end_time
          ? null
          : `${data.end_date}T${data.end_time}:00Z`;

      await dataProvider.create<Event>("events", {
        data: {
          title: data.title,
          description: data.description || null,
          event_type: data.event_type,
          start_datetime,
          end_datetime,
          all_day: data.all_day,
          location: data.location || null,
          status: "scheduled",
          sales_id: identity?.id,
        },
      });

      notify("Event created successfully", { type: "success" });
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating event:", error);
      notify("Failed to create event", { type: "error" });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-oswald text-2xl uppercase tracking-wide font-bold text-slate-900">
            Create Event
          </DialogTitle>
          <DialogDescription className="font-sans text-slate-600">
            Schedule a new event on your calendar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="font-oswald uppercase text-sm tracking-wide font-semibold text-slate-900"
            >
              Event Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              placeholder="e.g., Discovery Call - Phoenix Franchise"
              disabled={isSubmitting}
              className="border-slate-200 focus:ring-2 focus:ring-blue-500 font-sans"
            />
            {errors.title && (
              <p className="font-sans text-sm text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label className="font-oswald uppercase text-sm tracking-wide font-semibold text-slate-900">
              Event Type
            </Label>
            <Select
              value={eventType}
              onValueChange={(value) =>
                setValue("event_type", value as EventType)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className="border-slate-200 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* All Day Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all_day"
              {...register("all_day")}
              disabled={isSubmitting}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <Label
              htmlFor="all_day"
              className="font-sans text-sm text-slate-900 cursor-pointer"
            >
              All-day event
            </Label>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-sans text-sm font-medium text-slate-900">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                {...register("start_date", { required: true })}
                disabled={isSubmitting}
                className="border-slate-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!allDay && (
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-slate-900">
                  Start Time
                </Label>
                <Input
                  type="time"
                  {...register("start_time")}
                  disabled={isSubmitting}
                  className="border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-slate-900">
                  End Date
                </Label>
                <Input
                  type="date"
                  {...register("end_date")}
                  disabled={isSubmitting}
                  className="border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-sans text-sm font-medium text-slate-900">
                  End Time
                </Label>
                <Input
                  type="time"
                  {...register("end_time")}
                  disabled={isSubmitting}
                  className="border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="font-sans text-sm font-medium text-slate-900"
            >
              Location
            </Label>
            <Input
              id="location"
              {...register("location")}
              placeholder="e.g., Zoom, Office, Client Site"
              disabled={isSubmitting}
              className="border-slate-200 focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="font-sans text-sm font-medium text-slate-900"
            >
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Event details and notes..."
              rows={3}
              disabled={isSubmitting}
              className="border-slate-200 focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

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
                  Creating Event...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
