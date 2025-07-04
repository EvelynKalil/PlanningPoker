import React, { useState, ChangeEvent, FormEvent } from 'react'
import InputText from '../../atoms/InputText/InputText'
import Button from '../../atoms/Button/Button'
import { useNavigate } from 'react-router-dom'
import './FormCreateGame.css'

const FormCreateGame = () => {
   // Estado para el nombre de la partida
  const [name, setName] = useState<string>('')
   // Estado que indica si el nombre es válido según las reglas
  const [isValid, setIsValid] = useState<boolean>(false)
  // Lista de mensajes de error de validación
  const [errors, setErrors] = useState<string[]>([])
   // Hook para cambiar de ruta sin recargar la página
  const navigate = useNavigate()

   // Maneja cada pulsación en el input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setName(input)
    validateName(input)
  }

  // Función que aplica las reglas de validación al texto
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
    // Guardar errores y marcar si es válido (sin errores)
    setErrors(currentErrors)
    setIsValid(currentErrors.length === 0)
  }

  //Función que se ejecuta al enviar el formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()      // evita recarga de página
    if (isValid) {          // sólo si pasa validación
      // Guardar en localStorage para compartir con SalaPage
      localStorage.setItem('nombrePartida', name)
      localStorage.setItem('esAdmin', 'true')
      // Navegar a la URL de la sala
      navigate(`/sala/${name}`)
    }
  }

  return (
    <form className="form-create-game" onSubmit={handleSubmit}>
      <label htmlFor="gameName">Nombra la partida</label>
      <InputText
        id = "gameName"
        value={name}
        onChange={handleChange}
        //si el array errors contiene al menos un mensaje evaluará a true
        isInvalid={errors.length > 0}
      />
      {/*  si hay errores muesta la lista de errores  */}
      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}
      <div className="button-wrapper">
        {/* Deshabilita el botón si el nombre no cumple la validación */}
        <Button type="submit" disabled={!isValid}>
          Crear partida
        </Button>
      </div>
    </form>
  )
}

export default FormCreateGame
