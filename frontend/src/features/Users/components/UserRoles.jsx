import React, { useState, useEffect } from 'react'
import { FiUser, FiShield, FiCheck, FiX, FiPlus, FiTrash2, FiEdit } from 'react-icons/fi'
import Button from '@components/ui/Button'
import { useRoles, usePermissions, useAssignRole, useRemoveRole, useAssignPermission, useRemovePermission, useUser } from '../hooks/useUsers'

const UserRoles = ({ user, onClose }) => {
  const [activeTab, setActiveTab] = useState('roles')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedPermission, setSelectedPermission] = useState('')

  // API hooks
  const { data: userData } = useUser(user?.id)
  const { data: rolesData } = useRoles()
  const { data: permissionsData } = usePermissions()
  const assignRoleMutation = useAssignRole()
  const removeRoleMutation = useRemoveRole()
  const assignPermissionMutation = useAssignPermission()
  const removePermissionMutation = useRemovePermission()

  // Xử lý gán vai trò
  const handleAssignRole = async () => {
    if (selectedRole) {
      await assignRoleMutation.mutateAsync({
        userId: user.id,
        roleId: selectedRole
      })
      setSelectedRole('')
    }
  }

  // Xử lý xóa vai trò
  const handleRemoveRole = async (roleId) => {
    await removeRoleMutation.mutateAsync({
      userId: user.id,
      roleId
    })
  }

  // Xử lý gán quyền
  const handleAssignPermission = async () => {
    if (selectedPermission) {
      await assignPermissionMutation.mutateAsync({
        userId: user.id,
        permissionId: selectedPermission
      })
      setSelectedPermission('')
    }
  }

  // Xử lý xóa quyền
  const handleRemovePermission = async (permissionId) => {
    await removePermissionMutation.mutateAsync({
      userId: user.id,
      permissionId
    })
  }

  // Kiểm tra quyền đã được gán
  const hasPermission = (permissionId) => {
    return userData?.permissions?.some(p => p.id === permissionId) || false
  }

  // Kiểm tra vai trò đã được gán
  const hasRole = (roleId) => {
    return userData?.roles?.some(r => r.id === roleId) || false
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0 h-12 w-12">
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={user.avatar || '/images/default-avatar.png'}
              alt={user.name}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'roles'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiShield className="h-4 w-4 inline mr-2" />
            Vai trò
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiUser className="h-4 w-4 inline mr-2" />
            Quyền hạn
          </button>
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Assign Role */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Gán vai trò mới</h4>
            <div className="flex space-x-3">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Chọn vai trò</option>
                {rolesData?.filter(role => !hasRole(role.id)).map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRole || assignRoleMutation.isLoading}
                loading={assignRoleMutation.isLoading}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Gán vai trò
              </Button>
            </div>
          </div>

          {/* Current Roles */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Vai trò hiện tại</h4>
            {userData?.roles?.length > 0 ? (
              <div className="space-y-2">
                {userData.roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FiShield className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-500">{role.description}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveRole(role.id)}
                      loading={removeRoleMutation.isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có vai trò nào được gán</p>
            )}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Assign Permission */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Gán quyền mới</h4>
            <div className="flex space-x-3">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
              >
                <option value="">Chọn quyền</option>
                {permissionsData?.filter(permission => !hasPermission(permission.id)).map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleAssignPermission}
                disabled={!selectedPermission || assignPermissionMutation.isLoading}
                loading={assignPermissionMutation.isLoading}
              >
                <FiPlus className="h-4 w-4 mr-2" />
                Gán quyền
              </Button>
            </div>
          </div>

          {/* Current Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Quyền hiện tại</h4>
            {userData?.permissions?.length > 0 ? (
              <div className="space-y-2">
                {userData.permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FiUser className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-sm text-gray-500">{permission.description}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemovePermission(permission.id)}
                      loading={removePermissionMutation.isLoading}
                      className="text-red-600 hover:text-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Chưa có quyền nào được gán</p>
            )}
          </div>

          {/* All Available Permissions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Tất cả quyền có sẵn</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {permissionsData?.map((permission) => (
                <div key={permission.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center">
                    {hasPermission(permission.id) ? (
                      <FiCheck className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                      <FiX className="h-4 w-4 text-gray-400 mr-2" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                      <div className="text-xs text-gray-500">{permission.description}</div>
                    </div>
                  </div>
                  {!hasPermission(permission.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAssignPermission(permission.id)}
                      loading={assignPermissionMutation.isLoading}
                    >
                      <FiPlus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Đóng
        </Button>
      </div>
    </div>
  )
}

export default UserRoles
