import { tw } from '../../config/theme';

const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
  border = true,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  const shadowClass = shadow ? 'shadow-lg' : '';
  const borderClass = border ? 'border border-[#e8dfd3]' : '';
  
  const classes = `${baseClasses} ${paddingClasses[padding]} ${shadowClass} ${borderClass} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-[#bfa77b] text-xl font-semibold ${className}`} style={{ fontFamily: 'Playfair Display, serif' }}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-[#e7dcc8] ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;