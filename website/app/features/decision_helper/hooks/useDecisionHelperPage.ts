import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../store/store";
import { fetchAllDecisionHelperData, setTabValue, clearError, fetchCalendarEvents, fetchCommonDecisions, fetchTasks, fetchProjects } from "../../../../store/decisionHelperSlice";
import { useEffect } from "react";

export const useDecisionHelperPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { calendarEvents, commonDecisions, tasks, projects, loading, error, tabValue } = useSelector((state: RootState) => state.decisionHelper);

  useEffect(() => {
    dispatch(fetchAllDecisionHelperData());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    dispatch(setTabValue(newValue));
  };

  const handleClearError = () => {
    dispatch(clearError());
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
