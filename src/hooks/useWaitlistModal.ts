import { useModal } from '@/app/modal-provider';

export const useWaitlistModal = () => {
  const { openWaitlistModal } = useModal();
  
  return {
    openWaitlistModal
  };
};