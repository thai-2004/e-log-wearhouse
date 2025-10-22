import React, { useState, useEffect } from 'react'
import { FiSearch, FiX, FiClock } from 'react-icons/fi'
import { useSearchProducts } from '../hooks/useProducts'

const ProductSearch = ({ 
  onProductSelect, 
  placeholder = "Tìm kiếm sản phẩm...",
  showRecent = true,
  maxResults = 10 
}) => {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  const { data: searchResults, isLoading } = useSearchProducts(query)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-product-searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = (searchTerm) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recent-product-searches', JSON.stringify(updated))
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(value.length > 0)
  }

  const handleProductSelect = (product) => {
    saveRecentSearch(product.name)
    onProductSelect?.(product)
    setQuery('')
    setShowResults(false)
  }

  const handleRecentSearch = (searchTerm) => {
    setQuery(searchTerm)
    setShowResults(true)
  }

  const clearSearch = () => {
    setQuery('')
    setShowResults(false)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recent-product-searches')
  }

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder={placeholder}
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowResults(true)}
        />
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500 text-center">
              Đang tìm kiếm...
            </div>
          ) : query.length > 0 ? (
            <>
              {searchResults?.products?.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                    Kết quả tìm kiếm ({searchResults.products.length})
                  </div>
                  {searchResults.products.slice(0, maxResults).map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image || '/images/no-image.png'}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {product.sku} • Tồn: {product.stock}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-primary-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(product.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="px-4 py-2 text-gray-500 text-center">
                  Không tìm thấy sản phẩm nào
                </div>
              )}
            </>
          ) : showRecent && recentSearches.length > 0 ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tìm kiếm gần đây
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Xóa tất cả
                </button>
              </div>
              {recentSearches.map((searchTerm, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-2"
                  onClick={() => handleRecentSearch(searchTerm)}
                >
                  <FiClock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{searchTerm}</span>
                </div>
              ))}
            </>
          ) : (
            <div className="px-4 py-2 text-gray-500 text-center">
              Nhập từ khóa để tìm kiếm sản phẩm
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  )
}

export default ProductSearch
