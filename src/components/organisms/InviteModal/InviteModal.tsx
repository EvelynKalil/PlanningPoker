import React, { useState } from 'react';
import Button from '../../atoms/Button/Button';
import Input from '../../atoms/InputText/InputText';
import './InviteModal.css';

interface InviteModalProps {
  roomLink: string;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ roomLink, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
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
