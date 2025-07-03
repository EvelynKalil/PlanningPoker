import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest' // 👈 IMPORTANTE
import Button from '../components/atoms/Button/Button' // ✅ Ajusta el path si está mal

describe('Button', () => {
  it('muestra el texto correctamente', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('dispara el evento onClick', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalled()
  })
})
