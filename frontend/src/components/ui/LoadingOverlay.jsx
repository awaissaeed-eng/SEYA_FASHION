import LoadingSpinner from './LoadingSpinner';

const LoadingOverlay = ({ 
  show = false,
  text = 'Loading...',
  backdrop = true,
  size = 'lg',
  className = ''
}) => {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {backdrop && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      )}
      <div className="relative bg-white rounded-lg shadow-lg p-6 sm:p-8 mx-4 max-w-sm w-full">
        <div className="text-center space-y-4">
          <LoadingSpinner size={size} color="primary" />
          {text && (
            <p className="text-[#592a0d] font-medium text-sm sm:text-base">
              {text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;