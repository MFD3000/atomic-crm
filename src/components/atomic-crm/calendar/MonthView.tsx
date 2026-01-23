import { useMemo } from "react";
import type { Event } from "../types";

interface MonthViewProps {
  currentDate: Date;
  events: Event[];
  isLoading: boolean;
  onDateClick: (date: Date) => void;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  task: "#f59e0b", // amber
  milestone: "#2563eb", // blue
  meeting: "#10b981", // emerald
  appointment: "#06b6d4", // cyan
  deadline: "#ef4444", // red
};

export const MonthView = ({
  currentDate,
  events,
  isLoading,
  onDateClick,
}: MonthViewProps) => {
  const { days, firstDayOfMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const daysArray: (Date | null)[] = [];

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      daysArray.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }

    return { days: daysArray, firstDayOfMonth: firstDay };
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_datetime);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-3 text-center font-oswald uppercase text-sm tracking-wide font-semibold text-slate-900"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="border-r border-b border-slate-200 bg-slate-50/50"
              />
            );
          }

          const dayEvents = getEventsForDate(date);
          const isTodayDate = isToday(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`
                border-r border-b border-slate-200 p-2
                hover:bg-blue-50 transition-colors cursor-pointer
                flex flex-col
                ${isTodayDate ? "bg-blue-50/50" : "bg-white"}
              `}
            >
              {/* Date Number */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`
                    font-sans text-sm font-medium
                    ${isTodayDate ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-slate-900"}
                  `}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events Preview */}
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const color =
                    EVENT_TYPE_COLORS[event.event_type] || "#64748b";
                  const time = event.all_day
                    ? "All day"
                    : new Date(event.start_datetime).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      );

                  return (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate font-sans"
                      style={{
                        backgroundColor: `${color}15`,
                        borderLeft: `3px solid ${color}`,
                      }}
                      title={event.title}
                    >
                      <div className="font-medium truncate">{time}</div>
                      <div className="truncate text-slate-700">
                        {event.title}
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-slate-500 font-sans pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="font-sans text-slate-600">Loading events...</div>
        </div>
      )}
    </div>
  );
};
