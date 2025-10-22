import React, { useState } from 'react'
import { FiDownload, FiFileText, FiFile, FiLoader, FiGrid } from 'react-icons/fi'

const ExportButton = ({ 
  data = [], 
  filename = 'export', 
  exportType = 'csv',
  onExport,
  className = '',
  disabled = false 
}) => {
  const [isExporting, setIsExporting] = useState(false)

  const getFileIcon = (type) => {
    switch (type) {
      case 'csv':
        return <FiGrid className="h-4 w-4" />
      case 'pdf':
        return <FiFileText className="h-4 w-4" />
      case 'excel':
        return <FiGrid className="h-4 w-4" />
      default:
        return <FiFile className="h-4 w-4" />
    }
  }

  const getFileExtension = (type) => {
    switch (type) {
      case 'csv':
        return '.csv'
      case 'pdf':
        return '.pdf'
      case 'excel':
        return '.xlsx'
      default:
        return '.txt'
    }
  }

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}${getFileExtension('csv')}`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToJSON = (data, filename) => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExport = async () => {
    if (disabled || isExporting) return

    setIsExporting(true)
    
    try {
      if (onExport) {
        await onExport()
      } else {
        switch (exportType) {
          case 'csv':
            exportToCSV(data, filename)
            break
          case 'json':
            exportToJSON(data, filename)
            break
          default:
            exportToCSV(data, filename)
        }
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={disabled || isExporting}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isExporting ? (
        <FiLoader className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <>
          <FiDownload className="h-4 w-4 mr-2" />
          {getFileIcon(exportType)}
        </>
      )}
      <span className="ml-2">
        {isExporting ? 'Exporting...' : `Export ${exportType.toUpperCase()}`}
      </span>
    </button>
  )
}

// Export Dropdown Component
const ExportDropdown = ({ 
  data = [], 
  filename = 'export',
  onExport,
  className = '',
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const exportOptions = [
    { type: 'csv', label: 'CSV', description: 'Comma-separated values' },
    { type: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
    { type: 'excel', label: 'Excel', description: 'Microsoft Excel format' },
    { type: 'pdf', label: 'PDF', description: 'Portable Document Format' }
  ]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FiDownload className="h-4 w-4 mr-2" />
        Export
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Export Format
              </div>
              
              {exportOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => {
                    setIsOpen(false)
                    // Handle export with specific type
                    if (onExport) {
                      onExport(option.type)
                    }
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      {getFileIcon(option.type)}
                      <span className="ml-3 font-medium">{option.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Dashboard Export Component
const DashboardExport = ({ dashboardData, userRole }) => {
  const [isExporting, setIsExporting] = useState(false)

  const handleDashboardExport = async (format) => {
    setIsExporting(true)
    
    try {
      // Prepare data based on user role
      let exportData = {}
      
      switch (userRole) {
        case 'admin':
          exportData = {
            summary: dashboardData.summary,
            systemStats: dashboardData.systemStats,
            alerts: dashboardData.alerts,
            recentActivities: dashboardData.recentActivities
          }
          break
        case 'manager':
          exportData = {
            summary: dashboardData.summary,
            businessMetrics: dashboardData.businessMetrics,
            alerts: dashboardData.alerts,
            recentActivities: dashboardData.recentActivities
          }
          break
        case 'staff':
          exportData = {
            summary: dashboardData.summary,
            operationalStats: dashboardData.operationalStats,
            todayTasks: dashboardData.todayTasks,
            alerts: dashboardData.alerts
          }
          break
        default:
          exportData = dashboardData
      }

      // Add metadata
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        userRole: userRole,
        data: exportData
      }

      // Export based on format
      switch (format) {
        case 'csv':
          // Convert to CSV format
          const csvData = Object.entries(exportPayload.data).map(([key, value]) => ({
            Category: key,
            Data: JSON.stringify(value)
          }))
          exportToCSV(csvData, `dashboard-${userRole}-${new Date().toISOString().split('T')[0]}`)
          break
        case 'json':
          exportToJSON(exportPayload, `dashboard-${userRole}-${new Date().toISOString().split('T')[0]}`)
          break
        default:
          exportToJSON(exportPayload, `dashboard-${userRole}-${new Date().toISOString().split('T')[0]}`)
      }
    } catch (error) {
      console.error('Dashboard export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <ExportDropdown
      data={dashboardData}
      filename={`dashboard-${userRole}`}
      onExport={handleDashboardExport}
      disabled={isExporting}
    />
  )
}

export { ExportButton, ExportDropdown, DashboardExport }
export default ExportButton
