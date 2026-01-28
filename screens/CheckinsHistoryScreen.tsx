import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { getISODate, prettyRefeicaoName, prettyVinculoName, getVinculoColor } from '../lib/utils';
import { Checkin, TipoVinculo } from '../types';
import DownloadIcon from '../components/icons/DownloadIcon';

const InvalidateModal = ({ checkin, onConfirm, onCancel }: { checkin: Checkin, onConfirm: (id: string, motivo: string) => void, onCancel: () => void }) => {
    const [motivo, setMotivo] = useState('');
    const { alunos } = useData();
    const aluno = alunos.find(a => a.id === checkin.alunoId);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Invalidar Check-in</h2>
                <p className="text-sm text-slate-600 mb-4">Tem certeza que deseja invalidar o check-in de <span className="font-semibold">{aluno?.nome}</span>?</p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Motivo da correção</label>
                        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 block w-full border rounded-md p-2" rows={3} required placeholder="Ex: Check-in duplicado"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="button" onClick={() => onConfirm(checkin.id, motivo)} className="px-4 py-2 bg-brand-red text-white rounded-md" disabled={!motivo.trim()}>Confirmar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EditCheckinVinculoModal = ({ checkin, onConfirm, onCancel }: { checkin: Checkin, onConfirm: (id: string, newVinculo: TipoVinculo, motivo: string) => void, onCancel: () => void }) => {
    const { alunos } = useData();
    const aluno = alunos.find(a => a.id === checkin.alunoId);
    const [newVinculo, setNewVinculo] = useState<TipoVinculo>(checkin.tipo_vinculo_no_checkin);
    const [motivo, setMotivo] = useState('');

    const activeVinculos = Object.values(TipoVinculo).filter(v => v !== TipoVinculo.CANCELADO);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-2">Corrigir Vínculo do Check-in</h2>
                <p className="text-sm text-slate-600 mb-4">
                    Alterar o vínculo do check-in de <span className="font-semibold">{aluno?.nome}</span>.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Novo Vínculo</label>
                        <select value={newVinculo} onChange={(e) => setNewVinculo(e.target.value as TipoVinculo)} className="mt-1 block w-full border rounded-md p-2">
                            {activeVinculos.map(v => <option key={v} value={v}>{prettyVinculoName(v)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600">Motivo da correção</label>
                        <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} className="mt-1 block w-full border rounded-md p-2" rows={2} required placeholder="Ex: Vínculo incorreto no cadastro"></textarea>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-200 rounded-md">Cancelar</button>
                        <button type="button" onClick={() => onConfirm(checkin.id, newVinculo, motivo)} className="px-4 py-2 bg-brand-purple text-white rounded-md" disabled={!motivo.trim()}>Salvar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckinsHistoryScreen = () => {
    const { checkins, alunos, invalidateCheckin, updateCheckinVinculo } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showInvalidateModal, setShowInvalidateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCheckin, setSelectedCheckin] = useState<Checkin | null>(null);

    const isoDate = getISODate(currentDate);
    const checkinsDoDia = checkins.filter(c => c.data_checkin === isoDate).sort((a,b) => b.hora_checkin.localeCompare(a.hora_checkin));

    const changeDay = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    }
    
    const handleInvalidateClick = (checkin: Checkin) => {
        setSelectedCheckin(checkin);
        setShowInvalidateModal(true);
    };

    const handleEditClick = (checkin: Checkin) => {
        setSelectedCheckin(checkin);
        setShowEditModal(true);
    };

    const handleConfirmInvalidate = (id: string, motivo: string) => {
        invalidateCheckin(id, motivo);
        setShowInvalidateModal(false);
        setSelectedCheckin(null);
    };

    const handleConfirmEditVinculo = (id: string, newVinculo: TipoVinculo, motivo: string) => {
        updateCheckinVinculo(id, newVinculo, motivo);
        setShowEditModal(false);
        setSelectedCheckin(null);
    };

    const downloadCSV = (csvContent: string, filename: string) => {
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = () => {
        let csv = 'Aluno;Turma;Hora;Refeição;Vínculo;Status;Motivo da Correção\n';

        checkinsDoDia.forEach(checkin => {
            const aluno = alunos.find(a => a.id === checkin.alunoId);
            const row = [
                `"${aluno?.nome || 'N/A'}"`,
                `"${aluno?.turma || 'N/A'}"`,
                checkin.hora_checkin.substring(0, 5),
                prettyRefeicaoName(checkin.tipo_refeicao),
                prettyVinculoName(checkin.tipo_vinculo_no_checkin),
                checkin.valido ? 'Válido' : 'Invalidado',
                `"${checkin.motivo_correcao || ''}"`
            ].join(';');
            csv += row + '\n';
        });

        downloadCSV(csv, `historico_checkins_${isoDate}.csv`);
    };

    return (
        <div className="space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Histórico de Check-ins</h1>
                 <button onClick={handleExportCSV} className="p-2 bg-slate-100 text-slate-600 rounded-lg shadow-sm hover:bg-slate-200 transition">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </header>
            
            <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-slate-200">&lt;</button>
                <span className="font-semibold">{currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-slate-200">&gt;</button>
            </div>

            <div className="space-y-3">
                {checkinsDoDia.length === 0 ? (
                    <p className="text-slate-500 text-center pt-8">Nenhum check-in para esta data.</p>
                ) : (
                    checkinsDoDia.map(checkin => {
                        const aluno = alunos.find(a => a.id === checkin.alunoId);
                        const vinculoColor = getVinculoColor(checkin.tipo_vinculo_no_checkin);
                        return (
                            <div key={checkin.id} className={`p-4 rounded-lg shadow-sm border-l-4 border-${vinculoColor}-500 transition-opacity ${!checkin.valido ? 'bg-slate-100 opacity-60' : 'bg-white'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`font-semibold ${!checkin.valido ? 'line-through' : ''}`}>{aluno?.nome || 'Aluno não encontrado'}</p>
                                        <p className={`text-sm text-slate-500 ${!checkin.valido ? 'line-through' : ''}`}>{aluno?.turma}</p>
                                        <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-${vinculoColor}-100 text-${vinculoColor}-700`}>
                                            {prettyVinculoName(checkin.tipo_vinculo_no_checkin)}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-mono font-semibold">{checkin.hora_checkin.substring(0,5)}</p>
                                        <p className="text-sm text-slate-500">{prettyRefeicaoName(checkin.tipo_refeicao)}</p>
                                    </div>
                                </div>
                                {!checkin.valido && (
                                     <div className="mt-2 p-2 bg-red-50 border-l-2 border-red-400 text-red-700 text-xs">
                                        <p className="font-semibold">Check-in Invalidado</p>
                                        <p>Motivo: {checkin.motivo_correcao}</p>
                                    </div>
                                )}
                                {checkin.valido && (
                                    <div className="text-right mt-2 flex justify-end space-x-4">
                                        <button onClick={() => handleEditClick(checkin)} className="text-xs font-semibold text-brand-blue hover:text-blue-700">
                                            Editar
                                        </button>
                                        <button onClick={() => handleInvalidateClick(checkin)} className="text-xs font-semibold text-red-500 hover:text-red-700">
                                            Invalidar
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
            
            {showInvalidateModal && selectedCheckin && (
                <InvalidateModal 
                    checkin={selectedCheckin} 
                    onConfirm={handleConfirmInvalidate} 
                    onCancel={() => setShowInvalidateModal(false)} 
                />
            )}
            {showEditModal && selectedCheckin && (
                <EditCheckinVinculoModal 
                    checkin={selectedCheckin}
                    onConfirm={handleConfirmEditVinculo}
                    onCancel={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
};

export default CheckinsHistoryScreen;