import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchAllDecisionHelperData, fetchCalendarEvents, fetchCommonDecisions, fetchTasks, fetchProjects } from "@/store/decision_helper";
import { useEffect, useState } from "react";

export const useDecisionHelperPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { calendarEvents } = useSelector((state: RootState) => state.decisionHelper.events);
  const { commonDecisions } = useSelector((state: RootState) => state.decisionHelper.commonDecisions);
  const { tasks } = useSelector((state: RootState) => state.decisionHelper.tasks);
  const { projects } = useSelector((state: RootState) => state.decisionHelper.projects);
  const { essentials } = useSelector((state: RootState) => state.decisionHelper.essentials);
  const loading = useSelector((state: RootState) => state.decisionHelper.events.loading || state.decisionHelper.tasks.loading || state.decisionHelper.projects.loading || state.decisionHelper.commonDecisions.loading || state.decisionHelper.essentials.loading);
  const error = useSelector((state: RootState) => state.decisionHelper.events.error || state.decisionHelper.tasks.error || state.decisionHelper.projects.error || state.decisionHelper.commonDecisions.error || state.decisionHelper.essentials.error);
  const [tabValue, setTabValueState] = useState(0);

  useEffect(() => {
    dispatch(fetchAllDecisionHelperData());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValueState(newValue);
  };

  const handleClearError = () => {
    // Since error is derived from multiple slices, we'll handle this at the component level if needed
  };

  // Individual fetch handlers if needed for refresh functionality
  const refetchCalendarEvents = () => {
    dispatch(fetchCalendarEvents());
  };

  const refetchCommonDecisions = () => {
    dispatch(fetchCommonDecisions());
  };

  const refetchTasks = () => {
    dispatch(fetchTasks());
  };

  const refetchProjects = () => {
    dispatch(fetchProjects());
  };

  const refetchAllData = () => {
    dispatch(fetchAllDecisionHelperData());
  };

  return {
    calendarEvents,
    commonDecisions,
    tasks,
    projects,
    essentials,
    loading,
    error,
    tabValue,
    handleTabChange,
    handleClearError,
    refetchCalendarEvents,
    refetchCommonDecisions,
    refetchTasks,
    refetchProjects,
    refetchAllData,
  };
};
