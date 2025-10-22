import React, { useState, useMemo } from 'react'
import { FiPlus, FiFilter, FiDownload, FiUpload, FiUsers, FiUserCheck, FiUserX, FiEdit, FiTrash2, FiEye, FiMapPin, FiStar } from 'react-icons/fi'
import Button from '@components/ui/Button'
import Table from '@components/ui/Table'
import Modal from '@components/ui/Modal'
import CustomerForm from './CustomerForm'
import CustomerCard from './CustomerCard'
import { useCustomers, useDeleteCustomer, useUpdateCustomerStatus, useExportCustomers, useImportCustomers, useCustomersOverview } from '../hooks/useCustomers'

const CustomerList = () => {
  const [showForm, setShowForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showCard, setShowCard] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [viewMode, setViewMode] = useState('table') // table, card
  const [filters, setFilters] = useState({
    group: '',
    status: '',
    search: '',
    vip: false
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // API hooks
  const { data: customersData, isLoading, error } = useCustomers({
    page: currentPage,
    limit: pageSize,
    ...filters
  })
  
  const { data: overviewData } = useCustomersOverview()
  const deleteCustomerMutation = useDeleteCustomer()
  const updateStatusMutation = useUpdateCustomerStatus()
  const exportCustomersMutation = useExportCustomers()
  const importCustomersMutation = useImportCustomers()

  // Xử lý lọc
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Xử lý xóa khách hàng
  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      await deleteCustomerMutation.mutateAsync(customerId)
    }
  }

  // Xử lý cập nhật trạng thái
  const handleUpdateStatus = async (customerId, status) => {
    await updateStatusMutation.mutateAsync({ id: customerId, status })
  }

  // Xử lý xuất file
  const handleExport = () => {
    exportCustomersMutation.mutate(filters)
  }

  // Xử lý import file
  const handleImport = async (file) => {
    await importCustomersMutation.mutateAsync(file)
    setShowImport(false)
  }

  // Định nghĩa cột cho bảng
  const columns = useMemo(() => [
    {
      header: 'Khách hàng',
      accessor: 'customer',
      render: (customer) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={customer.avatar || '/images/default-avatar.png'}
              alt={customer.name}
            />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <div className="text-sm font-medium text-gray-900">
                {customer.name}
              </div>
              {customer.isVip && (
                <FiStar className="h-4 w-4 text-yellow-500 ml-2" />
              )}
            </div>
            <div className="text-sm text-gray-500">
              {customer.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Nhóm',
      accessor: 'group',
      render: (customer) => (
        <span className="text-sm text-gray-900">
          {customer.group?.name || 'Chưa phân nhóm'}
        </span>
      )
    },
    {
      header: 'Điện thoại',
      accessor: 'phone',
      render: (customer) => (
        <span className="text-sm text-gray-900">
          {customer.phone || 'Chưa có'}
        </span>
      )
    },
    {
      header: 'Địa chỉ',
      accessor: 'address',
      render: (customer) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {customer.defaultAddress?.address || 'Chưa có địa chỉ'}
        </div>
      )
    },
    {
      header: 'Điểm tích lũy',
      accessor: 'points',
      render: (customer) => (
        <span className="text-sm font-medium text-blue-600">
          {customer.points || 0} điểm
        </span>
      )
    },
    {
      header: 'Trạng thái',
      accessor: 'status',
      render: (customer) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : customer.status === 'inactive'
            ? 'bg-red-100 text-red-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {customer.status === 'active' ? 'Hoạt động' : 
           customer.status === 'inactive' ? 'Không hoạt động' : 'Chờ xác nhận'}
        </span>
      )
    },
    {
      header: 'Ngày tạo',
      accessor: 'createdAt',
      render: (customer) => (
        <span className="text-sm text-gray-900">
          {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
        </span>
      )
    },
    {
      header: 'Thao tác',
      accessor: 'actions',
      render: (customer) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowCard(true)
            }}
          >
            <FiEye className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowForm(true)
            }}
          >
            <FiEdit className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleUpdateStatus(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
            loading={updateStatusMutation.isLoading}
          >
            {customer.status === 'active' ? <FiUserX className="h-4 w-4" /> : <FiUserCheck className="h-4 w-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteCustomer(customer.id)}
            loading={deleteCustomerMutation.isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <FiTrash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ], [deleteCustomerMutation.isLoading, updateStatusMutation.isLoading])

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-red-600">Có lỗi xảy ra khi tải danh sách khách hàng</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý khách hàng</h1>
            <p className="text-gray-600">Quản lý thông tin và giao dịch của khách hàng</p>
          </div>
          <div className="flex space-x-3">
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium rounded-l-md border ${
                  viewMode === 'table'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Bảng
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                  viewMode === 'card'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Thẻ
              </button>
            </div>
            
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
              disabled={exportCustomersMutation.isLoading}
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button
              onClick={() => {
                setSelectedCustomer(null)
                setShowForm(true)
              }}
            >
              <FiPlus className="h-4 w-4 mr-2" />
              Thêm khách hàng
            </Button>
          </div>
        </div>

        {/* Customer Stats */}
        {overviewData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiUsers className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-800">Tổng khách hàng</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {overviewData.totalCustomers}
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
                    {overviewData.activeCustomers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiStar className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">VIP</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {overviewData.vipCustomers}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center">
                <FiMapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-800">Có địa chỉ</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {overviewData.customersWithAddress}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customers Table/Cards */}
      {viewMode === 'table' ? (
        <Table
          columns={columns}
          data={customersData?.customers || []}
          loading={isLoading}
          emptyMessage="Không có dữ liệu khách hàng"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customersData?.customers?.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={() => {
                setSelectedCustomer(customer)
                setShowForm(true)
              }}
              onView={() => {
                setSelectedCustomer(customer)
                setShowCard(true)
              }}
              onDelete={() => handleDeleteCustomer(customer.id)}
              onToggleStatus={() => handleUpdateStatus(customer.id, customer.status === 'active' ? 'inactive' : 'active')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {customersData?.pagination && (
        <div className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} đến{' '}
              {Math.min(currentPage * pageSize, customersData.pagination.total)} trong tổng số{' '}
              {customersData.pagination.total} bản ghi
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
                Trang {currentPage} / {customersData.pagination.totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === customersData.pagination.totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={selectedCustomer ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'}
        size="lg"
      >
        <CustomerForm
          customer={selectedCustomer}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      {/* Customer Card Modal */}
      <Modal
        isOpen={showCard}
        onClose={() => setShowCard(false)}
        title="Chi tiết khách hàng"
        size="xl"
      >
        <CustomerCard
          customer={selectedCustomer}
          detailed={true}
          onClose={() => setShowCard(false)}
        />
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        title="Import danh sách khách hàng"
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
              <li>Cột bắt buộc: Tên, Email</li>
              <li>Cột tùy chọn: Điện thoại, Địa chỉ, Nhóm</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Bộ lọc khách hàng"
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
              placeholder="Tìm theo tên, email hoặc điện thoại..."
              value={filters.search}
              onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhóm khách hàng
            </label>
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.group}
              onChange={(e) => handleFiltersChange({ ...filters, group: e.target.value })}
            >
              <option value="">Tất cả nhóm</option>
              <option value="group1">Nhóm VIP</option>
              <option value="group2">Nhóm thường</option>
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

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={filters.vip}
                onChange={(e) => handleFiltersChange({ ...filters, vip: e.target.checked })}
              />
              <span className="ml-2 text-sm text-gray-700">Chỉ hiển thị khách hàng VIP</span>
            </label>
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

export default CustomerList
