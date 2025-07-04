import React, { useState } from 'react';
// Hook de estado para gestionar el feedback de “¡Copiado!”
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/InputText/InputText';
import './InviteModal.css';

//Props del componente
interface InviteModalProps {
  roomLink: string;      // Enlace para compartir
  onClose: () => void;   // Callback para cerrar el modal
}

const InviteModal: React.FC<InviteModalProps> = ({ roomLink, onClose }) => {
  // Estado local para saber si ya se ha copiado el enlace
  const [copied, setCopied] = useState(false);

  // Handler que copia al portapapeles y muestra feedback
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomLink); // Copia el enlace a clipboard
      setCopied(true); //Cambia el estado para mostrar “¡Copiado!”
      setTimeout(() => setCopied(false), 2000); // Oculta el mensaje después de 2 segundos
    } catch (err) {
      console.error('Error al copiar el enlace:', err);
    }
  };

  return (
    <div className="invite-modal-backdrop">
      <div className="invite-modal">
        <div className="modal-header">
          <h3>Invitar jugadores</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <Input
          value={roomLink}
          readOnly
          className="invite-link"
        />
        <Button onClick={handleCopy}>
          {copied ? '¡Copiado!' : 'Copiar enlace'}
        </Button>
      </div>
    </div>
  );
};

export default InviteModal;
