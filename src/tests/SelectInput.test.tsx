import { render, screen, fireEvent } from '@testing-library/react'
import SelectInput from '../components/atoms/SelectInput/SelectInput'
import { vi } from 'vitest'

describe('SelectInput', () => {
  const options = ['React', 'Vue', 'Angular']

  it('muestra las opciones del select', () => {
    render(
      <SelectInput
        value=""
        onChange={() => {}}
        options={options}
        placeholder="Escoge un framework"
      />
    )
    options.forEach(opt => {
      expect(screen.getByText(opt)).toBeInTheDocument()
    })
  })

  it('llama a onChange cuando se selecciona una opción', () => {
    const handleChange = vi.fn()
    render(<SelectInput value="" onChange={handleChange} options={options} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Vue' } })
    expect(handleChange).toHaveBeenCalledWith('Vue')
  })
})
