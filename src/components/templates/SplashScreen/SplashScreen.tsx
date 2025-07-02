import './SplashScreen.css';
import logo from '../../../assets/LogoPragma.png';
import icon from '../../../assets/Logo.png';

const SplashScreen = () => {
  return (
    <div className="splash-wrapper">
      <img src={icon} alt="Icono" className="splash-icon" />
      <img src={logo} alt="Logo Pragma" className="splash-logo" />
    </div>
  );
};

export default SplashScreen;
