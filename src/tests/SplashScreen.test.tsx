import { render, screen } from '@testing-library/react';
import SplashScreen from '../../src/components/templates/SplashScreen/SplashScreen';

describe('SplashScreen', () => {
  it('renderiza los logos correctamente', () => {
    render(<SplashScreen />);
    expect(screen.getByAltText('Icono')).toBeInTheDocument();
    expect(screen.getByAltText('Logo Pragma')).toBeInTheDocument();
  });
});
