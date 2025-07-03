import { render, screen } from '@testing-library/react'
import SpinnerCounting from '../components/atoms/SpinnerCounting/SpinnerCounting'

describe('SpinnerCounting', () => {
  it('muestra el texto "Contando votos"', () => {
    render(<SpinnerCounting />)
    expect(screen.getByText('Contando votos')).toBeInTheDocument()
  })

  it('muestra los 4 dots', () => {
    render(<SpinnerCounting />)
    const dots = screen.getAllByRole('presentation', { hidden: true })
    expect(dots.length).toBe(4)
  })
})
