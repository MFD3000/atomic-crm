import { useDataProvider } from "ra-core";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveBar } from "@nivo/bar";
import { TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

import { useConfigurationContext } from "../../root/ConfigurationContext";
import type { BoardAnalytics as BoardAnalyticsType } from "../../types";

export const BoardAnalytics = () => {
  const dataProvider = useDataProvider();
  const { currentBoard } = useConfigurationContext();

  // Fetch analytics for current board
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["deals_board_analytics", "getList", currentBoard?.id],
    queryFn: async () => {
      if (!currentBoard) return { data: [] };
      return await dataProvider.getList<BoardAnalyticsType>(
        "deals_board_analytics",
        {
          pagination: { page: 1, perPage: 100 },
          sort: { field: "stage_position", order: "ASC" },
          filter: { board_id: currentBoard.id },
        },
      );
    },
    enabled: !!currentBoard,
  });

  const analytics = analyticsData?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 bg-slate-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-sans text-slate-500 text-sm">
          No analytics data available yet
        </p>
        <p className="font-sans text-slate-400 text-xs mt-1">
          Create some deals to see analytics
        </p>
      </div>
    );
  }

  // Get board-level totals (same for all rows)
  const totals = analytics[0];
  const winRate =
    totals?.total_deals > 0
      ? ((totals.total_won / totals.total_deals) * 100).toFixed(1)
      : "0";

  // Prepare chart data
  const chartData = analytics.map((a) => ({
    stage: a.stage_label,
    deals: a.deal_count,
    active: a.active_count,
    color:
      a.stage === "won"
        ? "#22c55e"
        : a.stage === "lost"
          ? "#ef4444"
          : "#3b82f6",
  }));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-600" strokeWidth={2} />
            <span className="font-sans text-xs font-medium text-blue-700 uppercase tracking-wide">
              Total Deals
            </span>
          </div>
          <p className="font-oswald text-3xl font-bold text-blue-900">
            {totals?.total_deals || 0}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" strokeWidth={2} />
            <span className="font-sans text-xs font-medium text-green-700 uppercase tracking-wide">
              Revenue
            </span>
          </div>
          <p className="font-oswald text-3xl font-bold text-green-900">
            ${((totals?.total_revenue || 0) / 100).toLocaleString()}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" strokeWidth={2} />
            <span className="font-sans text-xs font-medium text-purple-700 uppercase tracking-wide">
              Win Rate
            </span>
          </div>
          <p className="font-oswald text-3xl font-bold text-purple-900">
            {winRate}%
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-lg border-2 border-slate-200 p-4">
        <h4 className="font-oswald uppercase text-sm font-semibold text-slate-900 mb-4">
          Deals by Stage
        </h4>
        <div className="h-64">
          <ResponsiveBar
            data={chartData}
            keys={["deals"]}
            indexBy="stage"
            margin={{ top: 10, right: 10, bottom: 50, left: 50 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            colors={(bar) => bar.data.color as string}
            borderRadius={4}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "",
              legendPosition: "middle",
              legendOffset: 32,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: "Deals",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            animate={true}
            motionConfig="gentle"
          />
        </div>
      </div>

      {/* Stage Breakdown */}
      <div className="space-y-2">
        <h4 className="font-oswald uppercase text-sm font-semibold text-slate-900 mb-3">
          Stage Breakdown
        </h4>
        {analytics.map((stage) => (
          <div
            key={stage.stage}
            className="bg-white rounded-lg border border-slate-200 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-oswald uppercase text-xs font-semibold text-slate-900">
                {stage.stage_label}
              </span>
              <span className="font-sans text-xs text-slate-500">
                {stage.deal_count} deals ({stage.stage_percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  stage.stage === "won"
                    ? "bg-green-500"
                    : stage.stage === "lost"
                      ? "bg-red-500"
                      : "bg-blue-500"
                }`}
                style={{ width: `${stage.stage_percentage}%` }}
              />
            </div>
            {stage.avg_amount > 0 && (
              <p className="font-sans text-xs text-slate-500 mt-1">
                Avg value: ${(stage.avg_amount / 100).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
