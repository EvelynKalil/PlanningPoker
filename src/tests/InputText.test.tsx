import { render, screen } from '@testing-library/react'
import InputText from '../components/atoms/InputText/InputText'

describe('InputText', () => {
  it('renderiza el input con el placeholder', () => {
    render(<InputText placeholder="Nombre" />)
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
  })

  it('aplica clase "invalid" si isInvalid es true', () => {
    render(<InputText placeholder="Nombre" isInvalid />)
    expect(screen.getByPlaceholderText('Nombre')).toHaveClass('invalid')
  })
})
