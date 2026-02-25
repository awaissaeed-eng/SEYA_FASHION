const VisuallyHidden = ({ children, as: Component = 'span', ...props }) => {
  const srOnlyClasses = `
    absolute w-px h-px p-0 -m-px overflow-hidden 
    whitespace-nowrap border-0 clip-[rect(0,0,0,0)]
  `;

  return (
    <Component className={srOnlyClasses} {...props}>
      {children}
    </Component>
  );
};

export default VisuallyHidden;