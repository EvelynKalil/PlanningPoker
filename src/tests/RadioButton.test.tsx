import { render, screen, fireEvent } from '@testing-library/react'
import RadioButton from '../components/atoms/RadioButton/RadioButton'
import { vi } from 'vitest'

describe('RadioButton', () => {
  it('renderiza con la etiqueta', () => {
    render(
      <RadioButton
        label="Opción A"
        name="test-group"
        value="a"
        checked={false}
        onChange={() => {}}
      />
    )
    expect(screen.getByLabelText('Opción A')).toBeInTheDocument()
  })

  it('llama a onChange cuando se hace click', () => {
    const handleChange = vi.fn()
    render(
      <RadioButton
        label="Opción A"
        name="test-group"
        value="a"
        checked={false}
        onChange={handleChange}
      />
    )
    fireEvent.click(screen.getByLabelText('Opción A'))
    expect(handleChange).toHaveBeenCalled()
  })
})
