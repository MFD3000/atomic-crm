import { useState } from "react";
import { useList, useGetIdentity } from "ra-core";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

import type { Event, Sale } from "../types";
import { MonthView } from "./MonthView";
import { EventCreate } from "./EventCreate";
import { EventList } from "./EventList";

export const CalendarPage = () => {
  const { identity } = useGetIdentity<Sale>();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch events for current month
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const endOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );

  const {
    data: events,
    isLoading,
    refetch,
  } = useList<Event>("events", {
    pagination: { page: 1, perPage: 1000 },
    sort: { field: "start_datetime", order: "ASC" },
    filter: {
      "start_datetime@gte": startOfMonth.toISOString(),
      "start_datetime@lte": endOfMonth.toISOString(),
    },
  });

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
    );
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (!identity) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-oswald uppercase text-4xl tracking-wide font-bold text-white mb-2">
              Calendar
            </h1>
            <p className="font-sans text-slate-300 text-lg">
              Schedule events, milestones, and meetings
            </p>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-sans font-medium px-6 py-2.5 rounded-md transition-colors shadow-sm hover:shadow-md gap-2"
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
              className="border-2 border-slate-200 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={today}
              className="border-2 border-slate-200 hover:bg-slate-50 font-sans font-medium"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="border-2 border-slate-200 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <h2 className="font-oswald uppercase text-2xl tracking-wide font-bold text-slate-900">
            {monthName}
          </h2>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-600" />
            <span className="font-sans text-sm text-slate-600">
              {events?.length || 0} events
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex gap-6 p-6">
          {/* Month View */}
          <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <MonthView
              currentDate={currentDate}
              events={events || []}
              isLoading={isLoading}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Event List Sidebar */}
          <div className="w-80 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <EventList
              events={events || []}
              isLoading={isLoading}
              onRefresh={refetch}
            />
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <EventCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedDate={selectedDate}
        onSuccess={() => {
          refetch();
          setSelectedDate(null);
        }}
      />
    </div>
  );
};
