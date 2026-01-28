import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { Aluno, TipoVinculo } from '../types';
import { prettyVinculoName, getVinculoColor, getISODate } from '../lib/utils';
import { Screen } from '../App';
import UploadIcon from '../components/icons/UploadIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PasswordConfirmationModal from '../components/PasswordConfirmationModal';

const CancellationModal = ({ aluno, onConfirm, onCancel }: { aluno: Aluno, onConfirm: (alunoId: string, dataFim: string, motivo: string) => void, onCancel: () => void }) => {
    const [dataFim, setDataFim] = useState(getISODate(new Date()));
    const [motivo, setMotivo] = useState('');

    const handleConfirm = () => {
        if (!motivo.trim() || !dataFim) {
            alert('Por favor, preencha a data e o motivo do cancelamento.');
            return;
        }
        onConfirm(aluno.id, dataFim, motivo);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Cancelar Contrato</h2>
                <p className="text-sm text-slate-600 mb-4">
                    Confirmar o cancelamento do contrato para <span className="font-semibold">{aluno.nome}</span>.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Data do Cancelamento</label>
                         <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Motivo</label>
                        <textarea 
                            value={motivo} 
                            onChange={(e) => setMotivo(e.target.value)} 
                            className="mt-1 block w-full border rounded-md p-2" 
                            rows={3} 
                            required 
                            placeholder="Ex: Saída da escola, troca de plano..."
                        ></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Voltar</button>
                        <button type="button" onClick={handleConfirm} className="px-4 py-2 bg-brand-red text-white rounded-md disabled:bg-opacity-50" disabled={!motivo.trim() || !dataFim}>Confirmar Cancelamento</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AlunoForm = ({ aluno, onSave, onCancel, onInitiateCancel }: { aluno: Aluno | null, onSave: (aluno: Aluno | Omit<Aluno, 'id'>) => void, onCancel: () => void, onInitiateCancel: (aluno: Aluno) => void }) => {
    const [formData, setFormData] = useState<Omit<Aluno, 'id'>>({
        nome: aluno?.nome || '',
        turma: aluno?.turma || '',
        tipo_vinculo: aluno?.tipo_vinculo || TipoVinculo.CONTRATO_MENSAL,
        data_inicio_vinculo: aluno?.data_inicio_vinculo || '',
        data_fim_vinculo: aluno?.data_fim_vinculo || '',
        observacao: aluno?.observacao || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (aluno) {
            onSave({ ...aluno, ...formData });
        } else {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">{aluno ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Nome</label>
                        <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Turma</label>
                        <input type="text" name="turma" value={formData.turma} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Vínculo</label>
                        <select name="tipo_vinculo" value={formData.tipo_vinculo} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2">
                            {Object.values(TipoVinculo).map(v => <option key={v} value={v}>{prettyVinculoName(v)}</option>)}
                        </select>
                    </div>
                    {formData.tipo_vinculo === TipoVinculo.CONTRATO_MENSAL && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Início do Contrato</label>
                                <input type="date" name="data_inicio_vinculo" value={formData.data_inicio_vinculo || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600">Fim do Contrato (Opcional)</label>
                                <input type="date" name="data_fim_vinculo" value={formData.data_fim_vinculo || ''} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" />
                            </div>
                        </>
                    )}
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Observação</label>
                        <textarea name="observacao" value={formData.observacao} onChange={handleChange} className="mt-1 block w-full border rounded-md p-2" rows={2}></textarea>
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                        {aluno && aluno.tipo_vinculo === TipoVinculo.CONTRATO_MENSAL && (
                            <button type="button" onClick={() => onInitiateCancel(aluno)} className="px-4 py-2 bg-red-50 text-brand-red border border-red-200 text-sm font-semibold rounded-md hover:bg-red-100">
                                Cancelar Contrato
                            </button>
                        )}
                        </div>
                        <div className="flex space-x-2">
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md">Salvar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AlunosScreen = ({ setActiveScreen }: { setActiveScreen: (screen: Screen) => void; }) => {
    const { alunos, addAluno, updateAluno, deleteAllAlunos } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleSave = (alunoData: Aluno | Omit<Aluno, 'id'>) => {
        if ('id' in alunoData) {
            updateAluno(alunoData);
        } else {
            addAluno(alunoData);
        }
        setIsFormOpen(false);
        setEditingAluno(null);
    };

    const handleInitiateCancel = (aluno: Aluno) => {
        setEditingAluno(aluno);
        setIsCancelModalOpen(true);
    };
    
    const handleConfirmCancellation = (alunoId: string, dataFim: string, motivo: string) => {
        const aluno = alunos.find(a => a.id === alunoId);
        if (!aluno) return;

        const updatedAluno = {
            ...aluno,
            tipo_vinculo: TipoVinculo.CANCELADO,
            data_fim_vinculo: dataFim,
            observacao: `[Contrato Cancelado em ${new Date().toLocaleDateString('pt-BR')}] Motivo: ${motivo}\n\n${aluno.observacao || ''}`.trim()
        };

        updateAluno(updatedAluno);
        
        setIsCancelModalOpen(false);
        setIsFormOpen(false);
        setEditingAluno(null);
    };
    
    const handleEdit = (aluno: Aluno) => {
        setEditingAluno(aluno);
        setIsFormOpen(true);
    }
    
    const handleAddNew = () => {
        setEditingAluno(null);
        setIsFormOpen(true);
    }
    
    const closeAllModals = () => {
        setIsFormOpen(false);
        setIsCancelModalOpen(false);
        setEditingAluno(null);
    }

    const handleDeleteAll = () => {
        setIsDeleteModalOpen(true);
    }

    const handleConfirmDeleteAll = (password: string) => {
        const SENHA_EXCLUSAO = 'apagar2024';
        if (password.trim() === SENHA_EXCLUSAO) {
            deleteAllAlunos();
            alert("Todos os alunos foram apagados com sucesso.");
        } else {
            alert("Senha incorreta. A operação foi cancelada.");
        }
        setIsDeleteModalOpen(false);
    };

    const filteredAlunos = useMemo(() => {
        return alunos.filter(a => a.nome.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [alunos, searchTerm]);
    
    return (
        <div className="space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Gerenciar Alunos</h1>
                <div className="flex space-x-2">
                    <button onClick={handleDeleteAll} className="p-2 bg-red-50 text-brand-red rounded-lg shadow-sm hover:bg-red-100 transition" title="Limpar Alunos">
                       <TrashIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setActiveScreen('importar')} className="p-2 bg-slate-100 text-slate-600 rounded-lg shadow-sm hover:bg-slate-200 transition">
                       <UploadIcon className="w-5 h-5" />
                    </button>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-brand-purple text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
                        Novo Aluno
                    </button>
                </div>
            </header>
             <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aluno..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
            />

            <div className="space-y-3">
                {filteredAlunos.map(aluno => {
                    const vinculoColor = getVinculoColor(aluno.tipo_vinculo);
                    
                    return (
                        <div key={aluno.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{aluno.nome}</p>
                                <p className="text-sm text-slate-500">{aluno.turma}</p>
                                <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-${vinculoColor}-100 text-${vinculoColor}-700`}>
                                    {prettyVinculoName(aluno.tipo_vinculo)}
                                </span>
                            </div>
                            <button onClick={() => handleEdit(aluno)} className="text-slate-500 hover:text-brand-purple">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" /></svg>
                            </button>
                        </div>
                    )
                })}
            </div>

            {isFormOpen && <AlunoForm aluno={editingAluno} onSave={handleSave} onCancel={closeAllModals} onInitiateCancel={handleInitiateCancel} />}
            {isCancelModalOpen && editingAluno && (
                <CancellationModal
                    aluno={editingAluno}
                    onConfirm={handleConfirmCancellation}
                    onCancel={() => setIsCancelModalOpen(false)}
                />
            )}
             {isDeleteModalOpen && (
                <PasswordConfirmationModal 
                    title="Confirmar Exclusão Total"
                    message="Esta ação é irreversível e apagará TODOS os alunos. Para continuar, digite a senha de exclusão abaixo."
                    onConfirm={handleConfirmDeleteAll} 
                    onCancel={() => setIsDeleteModalOpen(false)} 
                />
            )}
        </div>
    );
};

export default AlunosScreen;