import backgroundLogo from '../../assets/Background.png';
import Header from './header';
import Footer from './footer';
import FloatingSocialIcons from './FloatingSocialIcons';

// Fixed Background Logo Component
const BackgroundLogo = () => (
  <div 
    className="fixed inset-0 flex items-center justify-center pointer-events-none"
    style={{ zIndex: 0 }}
  >
    <img
      src={backgroundLogo}
      alt=""
      className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-auto opacity-[0.20]"
      style={{ 
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    />
  </div>
);

const UserLayout = ({ children, showHeader = true, showFooter = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f1e8] overflow-x-hidden">
      {showHeader && <Header />}
      <main className="flex-grow relative overflow-x-hidden">
        <BackgroundLogo />
        <div className="relative overflow-x-hidden" style={{ zIndex: 1 }}>
          {children}
        </div>
      </main>
      {showFooter && <Footer />}
      <FloatingSocialIcons />
    </div>
  );
};

export default UserLayout;
