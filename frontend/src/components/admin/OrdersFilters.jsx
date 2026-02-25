import { Search, Filter, RefreshCw, List, LayoutGrid } from 'lucide-react';
import { tw } from '../../config/theme';

const OrdersFilters = ({
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
  onRefresh
}) => {
  return (
    <div className={`${tw.card} p-4 sm:p-6`}>
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by customer or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent ${tw.bgCard} ${tw.primaryText} text-sm sm:text-base`}
          />
        </div>
        
        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full sm:w-[180px] pl-10 pr-4 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent ${tw.bgCard} ${tw.primaryText} text-sm sm:text-base`}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 justify-between sm:justify-end">
            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              className={`px-3 sm:px-4 py-2 border border-[#bfa77b] ${tw.primaryText} rounded-md hover:bg-[#bfa77b]/10 transition-colors flex items-center justify-center`}
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-[#e8dfd3] rounded-lg p-1 bg-white">
              <button
                onClick={() => setViewMode('all')}
                className={`p-2 rounded transition-colors flex items-center justify-center ${
                  viewMode === 'all' 
                    ? `${tw.primaryBg} text-white` 
                    : `${tw.primaryText} hover:bg-gray-100`
                }`}
                title="All Orders View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grouped')}
                className={`p-2 rounded transition-colors flex items-center justify-center ${
                  viewMode === 'grouped' 
                    ? `${tw.primaryBg} text-white` 
                    : `${tw.primaryText} hover:bg-gray-100`
                }`}
                title="Grouped by Status View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilters;