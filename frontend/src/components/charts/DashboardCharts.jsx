import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { dashboardAPI } from '@features/Dashboard/api/dashboardService'

// Chart colors
const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4'
}

// Revenue Chart Component
export const RevenueChart = ({ height = 300 }) => {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'revenue-chart'],
    queryFn: dashboardAPI.getRevenueChart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
        <div className="flex items-center justify-center h-64 text-red-600">
          <p>Failed to load revenue data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
            labelStyle={{ color: '#374151' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Inventory Chart Component
export const InventoryChart = ({ height = 300 }) => {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'inventory-chart'],
    queryFn: dashboardAPI.getInventoryChart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
        <div className="flex items-center justify-center h-64 text-red-600">
          <p>Failed to load inventory data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, 'Items']}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="inStock" fill={COLORS.success} name="In Stock" />
          <Bar dataKey="lowStock" fill={COLORS.warning} name="Low Stock" />
          <Bar dataKey="outOfStock" fill={COLORS.danger} name="Out of Stock" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Activity Chart Component
export const ActivityChart = ({ height = 300 }) => {
  const { data: chartData, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'activity-chart'],
    queryFn: dashboardAPI.getActivityChart,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
        <div className="flex items-center justify-center h-64 text-red-600">
          <p>Failed to load activity data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Activity</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData || []}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [value, 'Activities']}
            labelStyle={{ color: '#374151' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="inbound"
            stroke={COLORS.success}
            strokeWidth={2}
            name="Inbound"
          />
          <Line
            type="monotone"
            dataKey="outbound"
            stroke={COLORS.info}
            strokeWidth={2}
            name="Outbound"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Order Status Pie Chart
export const OrderStatusChart = ({ data = [], height = 300 }) => {
  const pieColors = [COLORS.success, COLORS.warning, COLORS.danger, COLORS.info]
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Performance Metrics Chart
export const PerformanceChart = ({ data = [], height = 300 }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Performance']}
            labelStyle={{ color: '#374151' }}
          />
          <Bar dataKey="value" fill={COLORS.secondary} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Mini Chart Component for Stats Cards
export const MiniChart = ({ data = [], color = COLORS.primary, height = 60 }) => {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default {
  RevenueChart,
  InventoryChart,
  ActivityChart,
  OrderStatusChart,
  PerformanceChart,
  MiniChart
}
