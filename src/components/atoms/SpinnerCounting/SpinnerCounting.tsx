import './SpinnerCounting.css';

const SpinnerCounting = () => {
  return (
    <div className="spinner-counting-wrapper">
      <div className="dots">
        <span className="dot dot1" role="presentation" />
        <span className="dot dot2" role="presentation"/>
        <span className="dot dot3" role="presentation"/>
        <span className="dot dot4" role="presentation"/>
      </div>
      <p>Contando votos</p>
    </div>
  );
};

export default SpinnerCounting;
