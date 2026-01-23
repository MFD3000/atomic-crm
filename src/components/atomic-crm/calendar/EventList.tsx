import { useState } from "react";
import { Calendar, Clock, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "../types";
import { EventEdit } from "./EventEdit";

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onRefresh: () => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  task: "#f59e0b",
  milestone: "#2563eb",
  meeting: "#10b981",
  appointment: "#06b6d4",
  deadline: "#ef4444",
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  task: "Task",
  milestone: "Milestone",
  meeting: "Meeting",
  appointment: "Appointment",
  deadline: "Deadline",
};

export const EventList = ({ events, isLoading, onRefresh }: EventListProps) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const upcomingEvents = events
    .filter(
      (event) =>
        new Date(event.start_datetime) >= new Date() &&
        event.status !== "cancelled",
    )
    .slice(0, 20);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setEditDialogOpen(true);
  };

  const formatDateTime = (datetime: string, allDay: boolean) => {
    const date = new Date(datetime);
    if (allDay) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-4 border-b border-slate-800">
        <h3 className="font-oswald uppercase text-lg tracking-wide font-bold text-white">
          Upcoming Events
        </h3>
        <p className="font-sans text-slate-300 text-sm mt-1">
          {upcomingEvents.length} scheduled
        </p>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="font-sans text-slate-500">Loading events...</p>
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="font-sans text-slate-500">No upcoming events</p>
          </div>
        ) : (
          upcomingEvents.map((event) => {
            const color = EVENT_TYPE_COLORS[event.event_type] || "#64748b";

            return (
              <div
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderLeftWidth: "4px", borderLeftColor: color }}
              >
                {/* Title and Type */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-sans font-medium text-sm text-slate-900 flex-1">
                    {event.title}
                  </h4>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: color }}
                  >
                    {EVENT_TYPE_LABELS[event.event_type]}
                  </span>
                </div>

                {/* Date/Time */}
                <div className="flex items-center gap-2 text-xs text-slate-600 font-sans mb-1">
                  <Clock className="w-3 h-3" strokeWidth={2} />
                  {formatDateTime(event.start_datetime, event.all_day)}
                  {event.end_datetime && !event.all_day && (
                    <>
                      <span>→</span>
                      {new Date(event.end_datetime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </>
                  )}
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-sans mb-1">
                    <MapPin className="w-3 h-3" strokeWidth={2} />
                    {event.location}
                  </div>
                )}

                {/* Status */}
                {event.status !== "scheduled" && (
                  <div className="flex items-center gap-2 text-xs font-sans mt-2">
                    {event.status === "completed" ? (
                      <>
                        <CheckCircle2
                          className="w-3 h-3 text-emerald-600"
                          strokeWidth={2}
                        />
                        <span className="text-emerald-600 font-medium">
                          Completed
                        </span>
                      </>
                    ) : event.status === "cancelled" ? (
                      <>
                        <XCircle
                          className="w-3 h-3 text-red-600"
                          strokeWidth={2}
                        />
                        <span className="text-red-600 font-medium">
                          Cancelled
                        </span>
                      </>
                    ) : (
                      <span className="text-blue-600 font-medium">
                        Confirmed
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Event Edit Dialog */}
      {selectedEvent && (
        <EventEdit
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          event={selectedEvent}
          onSuccess={() => {
            onRefresh();
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};
