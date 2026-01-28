import React, { useState } from 'react';

interface PasswordConfirmationModalProps {
    title: string;
    message: React.ReactNode;
    onConfirm: (password: string) => void;
    onCancel: () => void;
}

const PasswordConfirmationModal = ({ title, message, onConfirm, onCancel }: PasswordConfirmationModalProps) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(password);
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[70]">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">{title}</h2>
                <p className="text-sm text-slate-600 mb-4">
                    {message}
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Senha</label>
                         <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="mt-1 block w-full border rounded-md p-2" 
                            required 
                            autoFocus
                         />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button 
                            type="submit"
                            className="px-4 py-2 bg-brand-red text-white rounded-md disabled:bg-opacity-50" 
                            disabled={!password.trim()}
                        >
                            Confirmar Exclusão
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PasswordConfirmationModal;
