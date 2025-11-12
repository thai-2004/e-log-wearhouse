import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '../api/dashboardService'

export const useDashboardOverview = (params = {}) => {
  return useQuery(
    ['dashboard', 'overview', params],
    () => dashboardAPI.getOverview(params),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  )
}

export const useDashboardStats = (timeRange = '7d') => {
  return useQuery(
    ['dashboard', 'stats', timeRange],
    () => dashboardAPI.getStats(timeRange),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  )
}

export const useDashboardAlerts = () => {
  return useQuery(
    ['dashboard', 'alerts'],
    () => dashboardAPI.getAlerts(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
    }
  )
}

export const useRecentActivities = () => {
  return useQuery(
    ['dashboard', 'activities'],
    () => dashboardAPI.getRecentActivities(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 60 * 1000, // Refetch every minute
    }
  )
}

export const useTimeRangeStats = (timeRange, startDate, endDate) => {
  return useQuery(
    ['dashboard', 'timeRange', timeRange, startDate, endDate],
    () => dashboardAPI.getTimeRangeStats(timeRange, startDate, endDate),
    {
      enabled: !!(timeRange && startDate && endDate),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )
}

// Role-specific hooks
export const useAdminStats = () => {
  return useQuery(
    ['dashboard', 'admin', 'stats'],
    () => dashboardAPI.getAdminStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  )
}

export const useManagerStats = () => {
  return useQuery(
    ['dashboard', 'manager', 'stats'],
    () => dashboardAPI.getManagerStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  )
}

export const useStaffStats = () => {
  return useQuery(
    ['dashboard', 'staff', 'stats'],
    () => dashboardAPI.getStaffStats(),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  )
}


// Staff-specific hooks
export const useTodayTasks = () => {
  return useQuery(
    ['dashboard', 'staff', 'tasks'],
    () => dashboardAPI.getTodayTasks(),
    {
      staleTime: 1 * 60 * 1000, // 1 minute
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    }
  )
}

// Manager-specific hooks
export const useWarehousePerformance = () => {
  return useQuery(
    ['dashboard', 'manager', 'performance'],
    () => dashboardAPI.getWarehousePerformance(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  )
}

// Admin-specific hooks
export const useSystemStats = () => {
  return useQuery(
    ['dashboard', 'admin', 'system'],
    () => dashboardAPI.getSystemStats(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  )
}
