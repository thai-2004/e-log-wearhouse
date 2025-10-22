import React, { useState } from 'react'
import { FiSettings, FiGrid, FiList, FiEye, FiEyeOff, FiSave, FiRotateCcw } from 'react-icons/fi'

const DashboardCustomization = ({ onSave, onReset, initialSettings = {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState({
    layout: initialSettings.layout || 'grid',
    showCharts: initialSettings.showCharts !== false,
    showStats: initialSettings.showStats !== false,
    showActivities: initialSettings.showActivities !== false,
    showAlerts: initialSettings.showAlerts !== false,
    chartHeight: initialSettings.chartHeight || 300,
    refreshInterval: initialSettings.refreshInterval || 30000,
    ...initialSettings
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    onSave(settings)
    setIsOpen(false)
  }

  const handleReset = () => {
    const defaultSettings = {
      layout: 'grid',
      showCharts: true,
      showStats: true,
      showActivities: true,
      showAlerts: true,
      chartHeight: 300,
      refreshInterval: 30000
    }
    setSettings(defaultSettings)
    onReset(defaultSettings)
  }

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Dashboard Settings"
      >
        <FiSettings className="h-5 w-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Settings Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Dashboard Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiRotateCcw className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Layout Settings */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Layout Style
                  </label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSettingChange('layout', 'grid')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        settings.layout === 'grid'
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <FiGrid className="h-4 w-4" />
                      <span>Grid</span>
                    </button>
                    <button
                      onClick={() => handleSettingChange('layout', 'list')}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        settings.layout === 'list'
                          ? 'bg-primary-100 text-primary-700 border border-primary-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      <FiList className="h-4 w-4" />
                      <span>List</span>
                    </button>
                  </div>
                </div>

                {/* Visibility Settings */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Show Components
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'showCharts', label: 'Charts & Analytics', icon: FiEye },
                      { key: 'showStats', label: 'Statistics Cards', icon: FiEye },
                      { key: 'showActivities', label: 'Recent Activities', icon: FiEye },
                      { key: 'showAlerts', label: 'System Alerts', icon: FiEye }
                    ].map(({ key, label, icon: Icon }) => (
                      <label key={key} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleSettingChange(key, e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Chart Settings */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Chart Height
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="200"
                      max="500"
                      step="50"
                      value={settings.chartHeight}
                      onChange={(e) => handleSettingChange('chartHeight', parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm text-gray-600 w-12">
                      {settings.chartHeight}px
                    </span>
                  </div>
                </div>

                {/* Refresh Settings */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Auto Refresh Interval
                  </label>
                  <select
                    value={settings.refreshInterval}
                    onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                    <option value={60000}>1 minute</option>
                    <option value={300000}>5 minutes</option>
                    <option value={0}>Disabled</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    <FiSave className="h-4 w-4" />
                    <span>Save Settings</span>
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    <FiRotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default DashboardCustomization
