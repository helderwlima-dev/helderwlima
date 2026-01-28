import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { Aluno, AutorizacaoDiaria, TipoVinculo } from '../types';
import { getISODate } from '../lib/utils';

const AutorizacaoForm = ({ onSave, onCancel }: { onSave: (auth: Omit<AutorizacaoDiaria, 'id'>) => void, onCancel: () => void }) => {
    const { alunos } = useData();
    const [alunoId, setAlunoId] = useState('');
    const [observacao, setObservacao] = useState('');
    
    const alunosSemContrato = alunos.filter(a => a.tipo_vinculo !== TipoVinculo.CONTRATO_MENSAL && a.tipo_vinculo !== TipoVinculo.CANCELADO);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!alunoId) {
            alert("Selecione um aluno.");
            return;
        }
        onSave({ alunoId, data_autorizada: getISODate(new Date()), observacao });
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Nova Autorização Diária</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Aluno</label>
                        <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} className="mt-1 block w-full border rounded-md p-2" required>
                            <option value="">Selecione um aluno</option>
                            {alunosSemContrato.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-600">Observação</label>
                        <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} className="mt-1 block w-full border rounded-md p-2" rows={2}></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-brand-purple text-white rounded-md">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    )
};


const DiariasScreen = () => {
    const { autorizacoes, addAutorizacao, deleteAutorizacao, alunos } = useData();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());

    const autorizacoesDoDia = autorizacoes.filter(auth => auth.data_autorizada === getISODate(currentDate));

    const handleSave = (auth: Omit<AutorizacaoDiaria, 'id'>) => {
        addAutorizacao(auth);
        setIsFormOpen(false);
    }
    
    const changeDay = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    }

    return (
        <div className="space-y-4">
             <header className="text-center">
                <h1 className="text-2xl font-bold">Autorizações Diárias</h1>
                <p className="text-slate-500">Controle de diárias autorizadas</p>
            </header>

            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-slate-200">&lt;</button>
                <span className="font-semibold">{currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-slate-200">&gt;</button>
            </div>
            
             <button onClick={() => setIsFormOpen(true)} className="w-full py-3 bg-brand-blue text-white rounded-lg shadow-md hover:bg-opacity-90 transition">
                + Nova Autorização
            </button>
            
            <div className="bg-white p-4 rounded-lg border min-h-[10rem]">
                <p className="font-semibold text-slate-600 mb-2">{autorizacoesDoDia.length} autorizações</p>
                {autorizacoesDoDia.length === 0 ? (
                    <p className="text-slate-500 text-center pt-8">Nenhuma autorização para esta data.</p>
                ) : (
                    <ul className="space-y-2">
                        {autorizacoesDoDia.map(auth => {
                            const aluno = alunos.find(a => a.id === auth.alunoId);
                            return (
                            <li key={auth.id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                <span>{aluno?.nome || 'Aluno não encontrado'}</span>
                                <button onClick={() => deleteAutorizacao(auth.id)} className="text-red-500 hover:text-red-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                            </li>
                        )})}
                    </ul>
                )}
            </div>

            {isFormOpen && <AutorizacaoForm onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        </div>
    );
};

export default DiariasScreen;