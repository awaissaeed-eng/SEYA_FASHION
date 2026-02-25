const LoadingSkeleton = ({ 
  variant = 'text',
  width = 'full',
  height = 'auto',
  className = '',
  count = 1,
  ...props
}) => {
  const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-pulse rounded';
  
  const variants = {
    text: 'h-4',
    title: 'h-6',
    button: 'h-10',
    card: 'h-32',
    image: 'aspect-square',
    avatar: 'w-10 h-10 rounded-full',
    line: 'h-px'
  };

  const widths = {
    full: 'w-full',
    '3/4': 'w-3/4',
    '1/2': 'w-1/2',
    '1/3': 'w-1/3',
    '1/4': 'w-1/4'
  };

  const heights = {
    auto: '',
    xs: 'h-2',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12'
  };

  const skeletonClasses = `
    ${baseClasses}
    ${variants[variant]}
    ${widths[width]}
    ${height !== 'auto' ? heights[height] : ''}
    ${className}
  `;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClasses} {...props} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} {...props} />;
};

// Predefined skeleton layouts
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 space-y-3">
    <LoadingSkeleton variant="image" className="w-full aspect-[3/4]" />
    <LoadingSkeleton variant="title" width="3/4" />
    <LoadingSkeleton variant="text" width="1/2" />
    <LoadingSkeleton variant="button" />
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-[#e8dfd3] p-4 space-y-3">
    <div className="flex justify-between items-start">
      <LoadingSkeleton variant="title" width="1/3" />
      <LoadingSkeleton variant="button" width="1/4" />
    </div>
    <LoadingSkeleton variant="text" count={2} />
    <div className="flex justify-between items-center">
      <LoadingSkeleton variant="text" width="1/4" />
      <LoadingSkeleton variant="text" width="1/3" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 6 }) => (
  <tr className="border-b border-[#e8dfd3]">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <LoadingSkeleton variant="text" />
      </td>
    ))}
  </tr>
);

export default LoadingSkeleton;