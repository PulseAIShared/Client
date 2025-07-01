import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { WaitlistSignupModal } from '@/features/waitlist/components';

interface ModalContextType {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  isOpen: boolean;
  openWaitlistModal: (source?: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (content: ReactNode) => {
    setModalContent(content);
    setIsOpen(true);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const openWaitlistModal = (source = 'landing') => {
    const waitlistModal = (
      <WaitlistSignupModal
        isOpen={true}
        onClose={closeModal}
        source={source}
      />
    );
    openModal(waitlistModal);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalContent(null);
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Get the modal root element
  const modalRoot = document.getElementById('modal-root');

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen, openWaitlistModal }}>
      {children}
      {isOpen && modalContent && modalRoot && 
        createPortal(
          <div className="fixed inset-0 z-[10000]">
            {modalContent}
          </div>,
          modalRoot
        )
      }
    </ModalContext.Provider>
  );
};