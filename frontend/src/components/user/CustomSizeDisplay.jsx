import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Ruler, FileText, Image as ImageIcon } from 'lucide-react';

const CustomSizeDisplay = ({ customSize, compact = false, isCustomSize = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if this is a custom size item
  const isCustom = isCustomSize || customSize?.isCustom;
  
  if (!isCustom) {
    return null;
  }

  const { measurements, notes, measurementFiles } = customSize;

  // Count non-empty measurements
  const measurementCount = Object.values(measurements || {}).reduce((count, section) => {
    return count + Object.values(section || {}).filter(value => value && value !== '').length;
  }, 0);

  const fileCount = measurementFiles?.length || 0;
  
  // If there are files but no measurements, show "Custom Size" without measurement count
  const hasFiles = fileCount > 0;
  const hasMeasurements = measurementCount > 0;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#592a0d]">
        <Ruler className="w-4 h-4" />
        <span>Custom Size</span>
        {hasMeasurements && (
          <span className="text-xs text-gray-500">({measurementCount} measurements)</span>
        )}
        {hasFiles && (
          <span className="text-xs text-gray-500">
            {hasMeasurements ? '+ ' : ''}{fileCount} file{fileCount > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 bg-[#faf8f5] rounded-lg border border-[#e8dfd3]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4 text-[#bfa77b]" />
          <span className="font-medium text-[#592a0d]">Custom Size</span>
          <span className="text-xs text-gray-500">
            {hasMeasurements && hasFiles 
              ? `(${measurementCount} measurements, ${fileCount} file${fileCount > 1 ? 's' : ''})`
              : hasMeasurements 
                ? `(${measurementCount} measurements)`
                : hasFiles 
                  ? `(${fileCount} file${fileCount > 1 ? 's' : ''})`
                  : '(Custom Size)'
            }
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {/* Measurements */}
          {measurements && (
            <div className="space-y-2">
              {Object.entries(measurements).map(([section, values]) => {
                const sectionMeasurements = Object.entries(values || {}).filter(([_, value]) => value && value !== '');
                if (sectionMeasurements.length === 0) return null;

                return (
                  <div key={section} className="text-sm">
                    <h5 className="font-medium text-[#592a0d] capitalize mb-1">{section}:</h5>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 ml-2">
                      {sectionMeasurements.map(([key, value]) => (
                        <div key={key}>
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {value}"
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="text-sm">
              <h5 className="font-medium text-[#592a0d] mb-1">Notes:</h5>
              <p className="text-xs text-gray-600 ml-2">{notes}</p>
            </div>
          )}

          {/* Files */}
          {measurementFiles && measurementFiles.length > 0 && (
            <div className="text-sm">
              <h5 className="font-medium text-[#592a0d] mb-2">Uploaded Files:</h5>
              <div className="space-y-2 ml-2">
                {measurementFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border border-[#e8dfd3]">
                    {file.fileType === 'image' ? (
                      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={file.url}
                          alt={file.originalName}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(file.url, '_blank')}
                          title="Click to view full image"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#592a0d] truncate">
                        {file.originalName || file.filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.fileType === 'image' ? 'Image' : 'PDF'} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#bfa77b] hover:text-[#592a0d] transition-colors"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSizeDisplay;