import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { ContactGender, DealStage, NoteStatus } from "../types";
import {
  defaultCompanySectors,
  defaultContactGender,
  defaultDarkModeLogo,
  defaultDealCategories,
  defaultDealPipelineStatuses,
  defaultDealStages,
  defaultLightModeLogo,
  defaultNoteStatuses,
  defaultTaskTypes,
  defaultTitle,
} from "./defaultConfiguration";
import { useBoardsContext } from "./BoardsProvider";

// Define types for the context value
export interface ConfigurationContextValue {
  companySectors: string[];
  dealCategories: string[];
  dealPipelineStatuses: string[];
  dealStages: DealStage[];
  noteStatuses: NoteStatus[];
  taskTypes: string[];
  title: string;
  darkModeLogo: string;
  lightModeLogo: string;
  contactGender: ContactGender[];
}

export interface ConfigurationProviderProps {
  children: ReactNode;
  companySectors: string[];
  dealCategories: string[];
  dealPipelineStatuses: string[];
  dealStages: DealStage[];
  noteStatuses: NoteStatus[];
  taskTypes: string[];
  title: string;
  darkModeLogo: string;
  lightModeLogo: string;
  contactGender: ContactGender[];
}

// Create context with default value
export const ConfigurationContext = createContext<ConfigurationContextValue>({
  companySectors: defaultCompanySectors,
  dealCategories: defaultDealCategories,
  dealPipelineStatuses: defaultDealPipelineStatuses,
  dealStages: defaultDealStages,
  noteStatuses: defaultNoteStatuses,
  taskTypes: defaultTaskTypes,
  title: defaultTitle,
  darkModeLogo: defaultDarkModeLogo,
  lightModeLogo: defaultLightModeLogo,
  contactGender: defaultContactGender,
});

export const ConfigurationProvider = ({
  children,
  companySectors,
  dealCategories,
  dealPipelineStatuses,
  dealStages,
  darkModeLogo,
  lightModeLogo,
  noteStatuses,
  taskTypes,
  title,
  contactGender,
}: ConfigurationProviderProps) => {
  const value = useMemo(
    () => ({
      companySectors,
      dealCategories,
      dealPipelineStatuses,
      dealStages,
      darkModeLogo,
      lightModeLogo,
      noteStatuses,
      title,
      taskTypes,
      contactGender,
    }),
    [
      companySectors,
      dealCategories,
      dealPipelineStatuses,
      dealStages,
      darkModeLogo,
      lightModeLogo,
      noteStatuses,
      title,
      taskTypes,
      contactGender,
    ],
  );

  return (
    <ConfigurationContext.Provider value={value}>
      {children}
    </ConfigurationContext.Provider>
  );
};

// Hook that combines configuration and boards contexts
export const useConfigurationContext = () => {
  const config = useContext(ConfigurationContext);

  // Try to get boards context, but it might not be available yet
  let boardsContext;
  try {
    boardsContext = useBoardsContext();
  } catch {
    // BoardsProvider not available yet (we're outside Admin tree)
    boardsContext = {
      currentBoard: null,
      boards: [],
      currentBoardStages: [],
      boardsLoading: false,
      boardsError: null,
      switchBoard: () => {},
      refreshBoards: () => {},
    };
  }

  // Override dealStages with board stages if available
  const dealStages =
    boardsContext.currentBoardStages.length > 0
      ? boardsContext.currentBoardStages.map((s) => ({
          value: s.value,
          label: s.label,
        }))
      : config.dealStages;

  return {
    ...config,
    ...boardsContext,
    dealStages,
  };
};
