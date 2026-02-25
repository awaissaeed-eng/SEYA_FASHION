import React, { useState } from 'react';

export function SizeStockInput({ sizes, setSizes, disabled, isEditing = false }) {
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState('');
  const [addMode, setAddMode] = useState('replace'); // 'replace' or 'add'

  const handleAdd = () => {
    if (!selectedSize || !quantity || isNaN(quantity)) return;
    const qty = Number(quantity);
    if (qty <= 0) return;
    
    const existing = sizes.find(s => s.size === selectedSize);
    if (existing) {
      if (addMode === 'add') {
        // Add to existing quantity
        setSizes(sizes.map(s => s.size === selectedSize ? { ...s, quantity: s.quantity + qty } : s));
      } else {
        // Replace existing quantity
        setSizes(sizes.map(s => s.size === selectedSize ? { ...s, quantity: qty } : s));
      }
    } else {
      // Add new size
      setSizes([...sizes, { size: selectedSize, quantity: qty }]);
    }
    setSelectedSize('');
    setQuantity('');
  };

  const handleRemove = (size) => {
    // Create new array without the removed size - this triggers immediate state update
    const newSizes = sizes.filter(s => s.size !== size);
    setSizes(newSizes);
  };

  // Handle direct quantity edit for existing sizes
  const handleQuantityChange = (size, newQuantity) => {
    const qty = parseInt(newQuantity) || 0;
    setSizes(sizes.map(s => s.size === size ? { ...s, quantity: qty } : s));
  };

  const existingSize = sizes.find(s => s.size === selectedSize);
  const buttonText = existingSize 
    ? (addMode === 'add' ? `Add to ${selectedSize} (${existingSize.quantity})` : `Replace ${selectedSize}`)
    : 'Add Size';

  return (
    <div className="space-y-3">
      {/* Add new size */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedSize}
            onChange={e => setSelectedSize(e.target.value)}
            disabled={disabled}
            className="flex-1 sm:flex-none px-3 py-2 border border-[#e8dfd3] rounded-md bg-white text-[#592a0d] text-sm"
          >
            <option value="">Select Size</option>
            {sizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="Quantity"
            min="1"
            className="flex-1 sm:w-24 px-3 py-2 border border-[#e8dfd3] rounded-md bg-white text-[#592a0d] text-sm"
            disabled={disabled}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={disabled || !selectedSize || !quantity}
            className="px-3 sm:px-4 py-2 bg-[#bfa77b] text-white rounded-md hover:bg-[#592a0d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline">{buttonText}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
        
        {/* Add/Replace mode toggle for existing sizes */}
        {isEditing && existingSize && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="addMode"
                value="add"
                checked={addMode === 'add'}
                onChange={e => setAddMode(e.target.value)}
                className="text-[#592a0d]"
              />
              <span className="text-[#592a0d]">Add to existing ({existingSize.quantity})</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="addMode"
                value="replace"
                checked={addMode === 'replace'}
                onChange={e => setAddMode(e.target.value)}
                className="text-[#592a0d]"
              />
              <span className="text-[#592a0d]">Replace quantity</span>
            </label>
          </div>
        )}
      </div>
      
      {/* Existing sizes with editable quantities */}
      {sizes.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Current sizes (edit quantity directly):</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map(({ size, quantity: qty }) => (
              <div key={size} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#faf8f5] border border-[#e8dfd3] text-[#592a0d] text-sm font-medium">
                <span>{size}:</span>
                <input
                  type="number"
                  value={qty}
                  onChange={e => handleQuantityChange(size, e.target.value)}
                  min="0"
                  className="w-16 px-1 py-0.5 border border-[#e8dfd3] rounded text-center text-sm"
                  disabled={disabled}
                />
                <button 
                  type="button" 
                  onClick={() => handleRemove(size)} 
                  className="ml-1 text-red-500 hover:text-red-700"
                  disabled={disabled}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
          No sizes added. Product will be marked as "Out of Stock" until sizes are added.
        </p>
      )}
    </div>
  );
}
