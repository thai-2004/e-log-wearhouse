import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiUpload, FiUserCheck, FiUserX, FiEdit, FiTrash2, FiEye } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import UserForm from './UserForm'
import UserRoles from './UserRoles'
import { useUsers, useDeleteUser, useUpdateUserStatus, useExportUsers, useImportUsers, useInviteUser, useUserStats } from '../hooks/useUsers'
import Tooltip from '@components/ui/Tooltip'

const UserList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showRoles, setShowRoles] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const ROLE_LABELS = useMemo(() => ({
    admin: 'Quản trị viên',
    manager: 'Quản lý',
    staff: 'Nhân viên',
    viewer: 'Người xem'
  }), [])

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize
    }

    if (filters.search) {
      params.search = filters.search
    }

    if (filters.role) {
      params.role = filters.role
    }

    if (filters.status) {
      params.isActive = filters.status === 'active'
    }

    return params
  }, [currentPage, pageSize, filters])

  // API hooks
  const { data: usersData, isLoading, error } = useUsers(queryParams)
  const { data: userStats } = useUserStats()
  const deleteUserMutation = useDeleteUser()
  const updateStatusMutation = useUpdateUserStatus()
  const exportUsersMutation = useExportUsers()
  const importUsersMutation = useImportUsers()
  const inviteUserMutation = useInviteUser()

  const rawUsers = usersData?.data?.users ?? []
  const pagination = usersData?.data?.pagination

  const normalizedUsers = useMemo(() => {
    return rawUsers.map((user) => {
      const isActive = user.isActive !== undefined ? user.isActive : true
      const status = isActive ? 'active' : 'inactive'
      const roleKey = user.role || ''

      return {
        ...user,
        id: user.id || user._id,
        name: user.fullName || user.name || user.username,
        email: user.email,
        avatar: user.avatarUrl,
        roleKey,
        roleLabel: ROLE_LABELS[roleKey] || roleKey,
        roles: roleKey
          ? [{
            id: roleKey,
            name: ROLE_LABELS[roleKey] || roleKey
          }]
          : [],
        status,
        statusLabel: isActive ? 'Hoạt động' : 'Không hoạt động',
        isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    })
  }, [rawUsers, ROLE_LABELS])

  const totalPages = pagination?.pages || 1

  const paginationInfo = useMemo(() => {
    if (!pagination || !pagination.total) {
      return {
        start: 0,
        end: 0
      }
    }

    const start = (currentPage - 1) * pageSize + 1
    const end = Math.min(currentPage * pageSize, pagination.total)

    return { start, end }
  }, [pagination, currentPage, pageSize])

  const userSummary = useMemo(() => {
    const summary = userStats?.data?.summary || {}
    return {
      totalUsers: summary.totalUsers || 0,
      activeUsers: summary.activeUsers || 0,
      inactiveUsers: summary.inactiveUsers || 0,
      adminUsers: summary.adminUsers || 0
    }
  }, [userStats])

  const exportParams = useMemo(() => {
    const { page, limit, ...rest } = queryParams
    return rest
  }, [queryParams])

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      await deleteUserMutation.mutateAsync(userId)
    }
  }

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (userId, nextIsActive) => {
    await updateStatusMutation.mutateAsync({ id: userId, isActive: nextIsActive })
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportUsersMutation.mutate(exportParams)
  }

  // Xử lý import file
  const handleImport = async (file) => {
    await importUsersMutation.mutateAsync(file)
    setShowImport(false)
  }

  // Xử lý mời người dùng
  const handleInviteUser = async (data) => {
    await inviteUserMutation.mutateAsync(data)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Người dùng',
      accessor: 'name',
      render: (_, row) => {
        const name = row.name || row.username || 'Người dùng'
        const email = row.email || ''
        const avatar = row.avatar || row.avatarUrl || '/images/default-avatar.png'

        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={avatar}
                alt={name}
              />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {name}
              </div>
              <div className="text-sm text-gray-500">
                {email || '—'}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      header: 'Vai trò',
      accessor: 'roleLabel',
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.roleLabel ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {row.roleLabel}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Chưa có vai trò</span>
          )}
        </div>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'statusLabel',
      render: (_, row) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
            }`}
        >
          {row.statusLabel || (row.isActive ? 'Hoạt động' : 'Không hoạt động')}
        </span>
      )
    },
    {
      header: 'Đăng nhập cuối',
      accessor: 'lastLogin',
      render: (_, row) => (
        <span className="text-sm text-gray-900">
          {row.lastLogin ? new Date(row.lastLogin).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      render: (_, row) => (
        <span className="text-sm text-gray-900">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString('vi-VN') : '—'}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Tooltip text="Chỉnh sửa người dùng" position="top">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(row)
                setShowForm(true)
              }}
            >
              <FiEdit className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip text="Quản lý vai trò" position="top">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(row)
                setShowRoles(true)
              }}
            >
              <FiUserCheck className="h-4 w-4" />
            </Button>
          </Tooltip>

          <Tooltip text="Cập nhật trạng thái" position="top">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus(row.id, !row.isActive)}
              loading={updateStatusMutation.isLoading}
            >
              {row.isActive ? <FiUserX className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
            </Button>
          </Tooltip>

          <Tooltip text="Xóa người dùng" position="top">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeleteUser(row.id)}
              loading={deleteUserMutation.isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <FiTrash2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )
    }
  ], [deleteUserMutation.isLoading, updateStatusMutation.isLoading, handleUpdateStatus])

  if (error) {
    const isForbidden = error?.response?.status === 403
    const errorMessage = isForbidden
      ? 'Bạn không có quyền truy cập trang này. Chỉ quản trị viên và quản lý mới có thể xem danh sách người dùng.'
      : error?.response?.data?.message || 'Có lỗi xảy ra khi tải danh sách người dùng'

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-8">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isForbidden ? 'Không có quyền truy cập' : 'Có lỗi xảy ra'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{errorMessage}</p>
            {isForbidden && (
              <Button
                variant="outline"
                onClick={() => window.location.href = '/dashboard'}
              >
                Quay lại Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
            <p className="text-gray-600">Quản lý tài khoản và phân quyền người dùng</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowImport(true)}
            >
              <FiUpload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(true)}
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Lọc
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportUsersMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedUser(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiUserCheck className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Tổng người dùng</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {userSummary.totalUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiUserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">Hoạt động</p>
                  <p className="text-2xl font-bold text-green-900">
                    {userSummary.activeUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiUserX className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">Không hoạt động</p>
                  <p className="text-2xl font-bold text-red-900">
                    {userSummary.inactiveUsers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiEye className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Quản trị viên</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {userSummary.adminUsers}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={normalizedUsers}
        loading={isLoading}
        emptyMessage="Không có dữ liệu người dùng"
      />

      {/* Pagination */}
      {pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {paginationInfo.start} đến {paginationInfo.end} trong tổng số {pagination.total} bản ghi
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        size="lg"
      >
        <UserForm
          user={selectedUser}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* User Roles Modal */}
      <Modal
        isOpen={showRoles}
        onClose={() => setShowRoles(false)}
        title="Quản lý vai trò và quyền"
        size="xl"
      >
        <UserRoles
          user={selectedUser}
          onClose={() => setShowRoles(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import danh sách người dùng"
        size="md"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FiUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              Kéo thả file Excel vào đây hoặc click để chọn file
            </p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="import-file"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  handleImport(file)
                }
              }}
            />
            <label
              htmlFor="import-file"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              Chọn file
            </label>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>File phải có định dạng Excel (.xlsx, .xls)</li>
              <li>Cột bắt buộc: Tên, Email, Mật khẩu</li>
              <li>Cột tùy chọn: Vai trò, Trạng thái</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc người dùng"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Tìm theo tên hoặc email..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.role}
              onChange={(e) => handleFiltersChange({ ...filters, role: e.target.value })}
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="manager">Quản lý</option>
              <option value="staff">Nhân viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFiltersChange({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="pending">Chờ xác nhận</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowFilters(false)}
            >
              Đóng
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default UserList
