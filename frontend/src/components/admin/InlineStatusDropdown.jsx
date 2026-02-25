import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { getStatusInfo, getValidNextStatuses, isTerminalStatus } from '../../utils/orderStatusRules';

const InlineStatusDropdown = ({ 
  currentStatus, 
  orderId, 
  onStatusChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  const statusInfo = getStatusInfo(currentStatus);
  const validNextStatuses = getValidNextStatuses(currentStatus);
  const isTerminal = isTerminalStatus(currentStatus);

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
        <div className="absolute top-full left-0 mt-1 bg-white border border-[#e8dfd3] rounded-lg shadow-lg z-50 min-w-[140px]">
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