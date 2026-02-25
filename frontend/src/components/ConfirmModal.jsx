import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Send, XCircle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default' // 'default', 'email', 'danger'
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'email':
        return <Mail className="w-8 h-8 text-[#bfa77b]" />;
      case 'danger':
        return <XCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Send className="w-8 h-8 text-[#bfa77b]" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#592a0d] to-[#3d1c09] p-6 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                {getIcon()}
              </div>
              <h3 
                className="text-xl font-bold text-[#bfa77b]"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {title}
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-[#592a0d] text-center leading-relaxed">
                {message}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-[#e8dfd3] text-[#592a0d] rounded-xl font-semibold hover:bg-[#f5f1e8] transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                  type === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-[#592a0d] text-[#bfa77b] hover:bg-[#6b3410]'
                }`}
              >
                <Send className="w-4 h-4" />
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
