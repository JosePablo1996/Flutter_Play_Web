import React from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { type ToastProps } from './Toast';

export interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse items-end">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onClose}
            icon={toast.icon}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;