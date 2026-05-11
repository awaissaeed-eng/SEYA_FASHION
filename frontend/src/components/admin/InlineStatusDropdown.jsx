import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { getStatusInfo } from '../../utils/orderStatusDisplay';

/**
 * InlineStatusDropdown Component
 * 
 * Displays order status with dropdown to change to valid next statuses.
 * 
 * IMPORTANT: validNextStatuses MUST be fetched from backend API.
 * Do NOT calculate valid transitions in frontend - this is business logic
 * that belongs only in backend/utils/orderStatusRules.js
 * 
 * Example API call to get valid next statuses:
 * GET /api/orders/:orderId/valid-statuses
 * 
 * @param {string} currentStatus - Current order status
 * @param {string} orderId - Order ID
 * @param {string[]} validNextStatuses - Valid next statuses (from backend API)
 * @param {function} onStatusChange - Callback when status changes
 * @param {boolean} disabled - Whether dropdown is disabled
 */
const InlineStatusDropdown = ({ 
  currentStatus, 
  orderId,
  validNextStatuses = [], // MUST be fetched from backend API
  onStatusChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  const statusInfo = getStatusInfo(currentStatus);
  const isTerminal = validNextStatuses.length === 0; // Terminal if no valid next statuses

  // Update dropdown position
  const updatePosition = () => {
    if (dropdownRef.current && isOpen) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update position on scroll and resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const handleStatusSelect = async (newStatus) => {
    if (isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onStatusChange(orderId, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDropdown = () => {
    if (disabled || isTerminal || validNextStatuses.length === 0) {
      return;
    }
    setIsOpen(!isOpen);
    // Update position when opening
    if (!isOpen) {
      setTimeout(updatePosition, 0);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Current Status Button */}
      <button
        onClick={handleToggleDropdown}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
          transition-all duration-200 min-w-[100px] justify-center
          ${statusInfo.color}
          ${isTerminal || validNextStatuses.length === 0 
            ? 'cursor-not-allowed opacity-75' 
            : 'hover:opacity-80 cursor-pointer'
          }
          ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        title={
          isTerminal 
            ? `${statusInfo.label} - Terminal state (cannot be changed)`
            : validNextStatuses.length === 0
            ? `${statusInfo.label} - No valid transitions available`
            : `${statusInfo.label} - Click to change status`
        }
      >
        <span className="text-sm">{statusInfo.icon}</span>
        <span>{statusInfo.label}</span>
        {isTerminal ? (
          <Lock className="w-3 h-3" />
        ) : validNextStatuses.length > 0 && !disabled && !isLoading ? (
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        ) : null}
      </button>

      {/* Dropdown Menu */}
      {isOpen && validNextStatuses.length > 0 && (
        <div className="fixed" style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          zIndex: 9999
        }}>
          <div className="bg-white border border-[#e8dfd3] rounded-lg shadow-lg min-w-[140px]">
            <div className="py-1">
              {validNextStatuses.map((status) => {
                const nextStatusInfo = getStatusInfo(status);
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusSelect(status)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[#faf8f5] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <span className="text-sm">{nextStatusInfo.icon}</span>
                    <span className="text-[#592a0d]">{nextStatusInfo.label}</span>
                    {isLoading && (
                      <div className="ml-auto">
                        <div className="w-3 h-3 border border-[#592a0d] border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Transition Rules Info */}
            <div className="border-t border-[#e8dfd3] px-3 py-2 bg-[#faf8f5]">
              <p className="text-xs text-gray-600">
                <strong>Valid transitions:</strong>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {validNextStatuses.map(status => getStatusInfo(status).label).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 border border-[#592a0d] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default InlineStatusDropdown;