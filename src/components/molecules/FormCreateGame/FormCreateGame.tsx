import React, { useState, ChangeEvent, FormEvent } from 'react'
import InputText from '../../atoms/InputText/InputText'
import Button from '../../atoms/Button/Button'
import { useNavigate } from 'react-router-dom'
import './FormCreateGame.css'

const FormCreateGame = () => {
  const [name, setName] = useState<string>('')
  const [isValid, setIsValid] = useState<boolean>(false)
  const [errors, setErrors] = useState<string[]>([])
  const navigate = useNavigate()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setName(input)
    validateName(input)
  }

  const validateName = (text: string) => {
    const currentErrors: string[] = []

    if (text.length < 5 || text.length > 20) {
      currentErrors.push('Debe tener entre 5 y 20 caracteres')
    }

    if (/^\d+$/.test(text)) {
      currentErrors.push('No puede contener solo números')
    }

    if (/[_.\*#\/-]/.test(text)) {
      currentErrors.push('No se permiten caracteres especiales (_,.*#/-)')
    }

    const numberCount = (text.match(/\d/g) || []).length
    if (numberCount > 3) {
      currentErrors.push('Máximo 3 números permitidos')
    }

    setErrors(currentErrors)
    setIsValid(currentErrors.length === 0)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isValid) {
      localStorage.setItem('nombrePartida', name)
      localStorage.setItem('esAdmin', 'true')
      navigate(`/sala/${name}`)
    }
  }

  return (
    <form className="form-create-game" onSubmit={handleSubmit}>
      <label htmlFor="gameName">Nombra la partida</label>
      <InputText
        value={name}
        onChange={handleChange}
        isInvalid={errors.length > 0}
      />
      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
      <div className="button-wrapper">
        <Button
          label="Crear partida"
          type="submit"
          onClick={() => { }}
          disabled={!isValid}
        />
      </div>
    </form>
  )
}

export default FormCreateGame
