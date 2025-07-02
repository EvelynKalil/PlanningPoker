import './SpinnerCounting.css';

const SpinnerCounting = () => {
  return (
    <div className="spinner-counting-wrapper">
      <div className="dots">
        <span className="dot dot1" />
        <span className="dot dot2" />
        <span className="dot dot3" />
        <span className="dot dot4" />
      </div>
      <p>Contando votos</p>
    </div>
  );
};

export default SpinnerCounting;
