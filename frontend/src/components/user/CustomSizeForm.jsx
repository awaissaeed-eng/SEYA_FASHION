import React, { useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Info } from 'lucide-react';

const CustomSizeForm = ({ onSubmit, onCancel, loading = false, inline = false }) => {
  const [measurements, setMeasurements] = useState({
    kameez: {
      chest: '',
      waist: '',
      hips: '',
      shoulderWidth: '',
      armLength: '',
      kameezLength: ''
    },
    shalwar: {
      waist: '',
      hip: '',
      length: '',
      ankleWidth: ''
    },
    dupatta: {
      length: '',
      width: ''
    }
  });

  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const measurementLabels = {
    kameez: {
      chest: 'Chest',
      waist: 'Waist',
      hips: 'Hips',
      shoulderWidth: 'Shoulder Width',
      armLength: 'Arm Length',
      kameezLength: 'Kameez Length'
    },
    shalwar: {
      waist: 'Waist',
      hip: 'Hip',
      length: 'Length',
      ankleWidth: 'Ankle Width'
    },
    dupatta: {
      length: 'Length',
      width: 'Width'
    }
  };

  const handleMeasurementChange = (section, field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));

    // Clear error for this field
    if (errors[`${section}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = [];
    const newErrors = {};

    selectedFiles.forEach((file, index) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf';
      
      if (!isImage && !isPDF) {
        newErrors[`file_${index}`] = 'Only images (JPG, PNG) and PDF files are allowed';
        return;
      }

      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        newErrors[`file_${index}`] = 'File size must be less than 10MB';
        return;
      }

      validFiles.push({
        file,
        name: file.name,
        type: isImage ? 'image' : 'pdf',
        size: file.size,
        preview: isImage ? URL.createObjectURL(file) : null
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    let hasAnyMeasurement = false;
    let hasAnyFile = files.length > 0;

    // Check if at least one measurement is provided
    Object.keys(measurements).forEach(section => {
      Object.keys(measurements[section]).forEach(field => {
        const value = measurements[section][field];
        if (value && value.trim()) {
          hasAnyMeasurement = true;
          // Validate numeric value
          if (isNaN(parseFloat(value)) || parseFloat(value) <= 0) {
            newErrors[`${section}.${field}`] = 'Must be a positive number';
          }
        }
      });
    });

    // User must provide either measurements OR files (or both)
    if (!hasAnyMeasurement && !hasAnyFile) {
      newErrors.general = 'Please provide measurements manually OR upload a measurement file/picture';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const customSizeData = {
      measurements,
      notes: notes.trim(),
      files
    };

    onSubmit(customSizeData);
  };

  const renderMeasurementSection = (sectionKey, sectionTitle) => (
    <div key={sectionKey} className="bg-white rounded-lg p-4 border border-[#e8dfd3]">
      <h4 className={`${inline ? 'text-base' : 'text-lg'} font-semibold text-[#592a0d] mb-3 flex items-center gap-2`}>
        {sectionTitle}
        <Info className="w-4 h-4 text-[#bfa77b]" title={`Enter measurements for ${sectionTitle.toLowerCase()}`} />
      </h4>
      <div className={`grid ${inline ? 'grid-cols-1 gap-2' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
        {Object.keys(measurements[sectionKey]).map(field => (
          <div key={field}>
            <label className="block text-sm font-medium text-[#592a0d] mb-1">
              {measurementLabels[sectionKey][field]} (inches)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              value={measurements[sectionKey][field]}
              onChange={(e) => handleMeasurementChange(sectionKey, field, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent ${
                errors[`${sectionKey}.${field}`] ? 'border-red-500' : 'border-[#e8dfd3]'
              }`}
              placeholder="e.g. 36"
            />
            {errors[`${sectionKey}.${field}`] && (
              <p className="text-red-500 text-xs mt-1">{errors[`${sectionKey}.${field}`]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={inline ? "" : "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"}>
      <div className={inline ? "w-full" : "bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"}>
        {/* Header - Only show in modal mode */}
        {!inline && (
          <div className="p-6 border-b border-[#e8dfd3] flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-[#592a0d]">Custom Size Measurements</h3>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Choose one option:</strong> Upload a measurement chart/picture OR enter measurements manually.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={inline ? "" : "p-6"}>
          {/* Inline mode header */}
          {inline && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Choose one option:</strong> Enter measurements manually below OR upload a measurement chart/picture.
              </p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Option 1: File Upload - Move to top for better UX */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-[#592a0d] text-white text-xs px-2 py-1 rounded-full">Option 1</span>
              <label className="text-sm font-medium text-[#592a0d]">
                Upload Measurement Files
              </label>
            </div>
            <div className="border-2 border-dashed border-[#e8dfd3] rounded-lg p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="measurement-files"
                disabled={loading}
              />
              <label
                htmlFor="measurement-files"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-[#bfa77b]" />
                <p className="text-sm text-gray-600">
                  <strong>Upload your measurement chart or picture</strong>
                </p>
                <p className="text-xs text-gray-500">
                  Supported: JPG, PNG, PDF (max 10MB each)
                </p>
              </label>
            </div>

            {/* File Preview */}
            {files.length > 0 && (
              <div className={`mt-4 ${inline ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#faf8f5] rounded-lg border border-[#e8dfd3]">
                    {file.type === 'image' ? (
                      <div className="w-10 h-10 rounded overflow-hidden">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#592a0d] truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      disabled={loading}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* OR Divider */}
          <div className="mb-6 flex items-center">
            <div className="flex-1 border-t border-[#e8dfd3]"></div>
            <span className="px-4 text-sm text-gray-500 bg-[#f5f1e8]">OR</span>
            <div className="flex-1 border-t border-[#e8dfd3]"></div>
          </div>

          {/* Option 2: Manual Measurements */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#592a0d] text-white text-xs px-2 py-1 rounded-full">Option 2</span>
              <label className="text-sm font-medium text-[#592a0d]">
                Enter Measurements Manually
              </label>
            </div>

          {/* Measurement Sections */}
          <div className={`space-y-4 mb-6 ${inline ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'space-y-6'}`}>
            {renderMeasurementSection('kameez', 'Kameez')}
            {renderMeasurementSection('shalwar', 'Shalwar')}
            {renderMeasurementSection('dupatta', 'Dupatta')}
          </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#592a0d] mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={inline ? 2 : 3}
              className="w-full px-3 py-2 border border-[#e8dfd3] rounded-md focus:outline-none focus:ring-2 focus:ring-[#bfa77b] focus:border-transparent"
              placeholder="Any special instructions or additional measurements..."
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${inline ? '' : 'pt-4 border-t border-[#e8dfd3]'}`}>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-[#e8dfd3] text-[#592a0d] rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#592a0d] text-white rounded-md hover:bg-[#6d3a18] transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Adding to Cart...' : 'Add to Cart with Custom Size'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomSizeForm;