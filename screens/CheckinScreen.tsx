import React, { useState, useMemo, useEffect } from 'react';
import { useClock } from '../hooks/useClock';
import { useData } from '../hooks/useData';
import { getTipoRefeicao, formatarData, getISODate, prettyVinculoName, prettyRefeicaoName, getVinculoColor } from '../lib/utils';
import { Aluno, TipoVinculo, Checkin, TipoRefeicao } from '../types';
import { calculateDailyReport } from '../lib/reportUtils';
import HistoryIcon from '../components/icons/HistoryIcon';
import type { Screen } from '../App';

const CheckinScreen = ({ setActiveScreen }: { setActiveScreen: (screen: Screen) => void }) => {
  const clock = useClock();
  const { alunos, checkins, autorizacoes, addCheckin, updateAluno } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const tipoRefeicaoAtual = getTipoRefeicao(clock);
  const dataFormatada = formatarData(clock);
  const todayISO = getISODate(clock);

  const { byVinculo: dailyReport } = useMemo(() => calculateDailyReport(checkins, todayISO), [checkins, todayISO]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleCheckin = (aluno: Aluno) => {
    if (aluno.tipo_vinculo === TipoVinculo.CANCELADO) {
      setToast({
        message: `${aluno.nome} tem um contrato cancelado e não pode fazer check-in.`,
        type: 'error',
      });
      setSearchTerm('');
      return;
    }
      
    const alreadyCheckedIn = checkins.some(
      (checkin) =>
        checkin.alunoId === aluno.id &&
        checkin.data_checkin === todayISO &&
        checkin.tipo_refeicao === tipoRefeicaoAtual &&
        checkin.valido
    );

    if (alreadyCheckedIn) {
      setToast({
        message: `${aluno.nome} já fez check-in para esta refeição hoje.`,
        type: 'error',
      });
      setSearchTerm('');
      return;
    }
    
    const today = getISODate(new Date());

    const isContratoAtivo = 
        aluno.tipo_vinculo === TipoVinculo.CONTRATO_MENSAL &&
        aluno.data_inicio_vinculo &&
        aluno.data_inicio_vinculo <= today &&
        (!aluno.data_fim_vinculo || aluno.data_fim_vinculo >= today);

    let vinculoDoCheckin = TipoVinculo.OBSERVACAO;
    if (isContratoAtivo) {
        vinculoDoCheckin = TipoVinculo.CONTRATO_MENSAL;
    } else {
        const temAutorizacao = autorizacoes.some(auth => auth.alunoId === aluno.id && auth.data_autorizada === today);
        if (temAutorizacao) {
            vinculoDoCheckin = TipoVinculo.DIARIA;
        }
    }

    if (aluno.tipo_vinculo === TipoVinculo.CONTRATO_MENSAL && !isContratoAtivo) {
       const confirmed = window.confirm(
            `O contrato mensal de ${aluno.nome} não está ativo para hoje.\n\nDeseja registrar o check-in como ${prettyVinculoName(vinculoDoCheckin)}?`
        );
        if (!confirmed) {
            setSearchTerm('');
            return;
        }
    }

    addCheckin(aluno.id, tipoRefeicaoAtual, vinculoDoCheckin);
    setToast({ message: `Check-in de ${aluno.nome} como ${prettyVinculoName(vinculoDoCheckin)} realizado com sucesso!`, type: 'success' });
    setSearchTerm('');
  };

  const filteredAlunos = useMemo(() => {
    if (!searchTerm) return [];
    return alunos.filter(aluno =>
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }, [searchTerm, alunos]);
  
  const StatCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className={`flex-1 p-3 rounded-lg bg-${color}-50 text-center`}>
      <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
      <p className={`text-sm font-medium text-${color}-500`}>{label}</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <header className="text-center relative">
        <h1 className="text-2xl font-bold">Check-in Refeições</h1>
        <p className="text-slate-500">{dataFormatada}</p>
         <button 
          onClick={() => setActiveScreen('historico')} 
          className="absolute top-1/2 right-0 -translate-y-1/2 p-2 text-slate-500 hover:text-brand-purple"
          aria-label="Ver histórico de check-ins"
        >
            <HistoryIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="p-4 rounded-xl bg-brand-purple text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm opacity-90">Período atual</p>
            <p className="text-xl font-bold">{prettyRefeicaoName(tipoRefeicaoAtual)}</p>
          </div>
          <p className="text-4xl font-mono font-bold">{clock.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <StatCard label="Mensal" value={dailyReport[TipoVinculo.CONTRATO_MENSAL].almoco + dailyReport[TipoVinculo.CONTRATO_MENSAL].lanche + dailyReport[TipoVinculo.CONTRATO_MENSAL].combo} color="green" />
        <StatCard label="Diária" value={dailyReport[TipoVinculo.DIARIA].almoco + dailyReport[TipoVinculo.DIARIA].lanche + dailyReport[TipoVinculo.DIARIA].combo} color="blue" />
        <StatCard label="Observação" value={dailyReport[TipoVinculo.OBSERVACAO].almoco + dailyReport[TipoVinculo.OBSERVACAO].lanche + dailyReport[TipoVinculo.OBSERVACAO].combo} color="yellow" />
      </div>

      <div className="relative flex-grow flex flex-col space-y-4">
        <div className="relative">
            <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar aluno pelo nome..."
            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-brand-purple focus:outline-none"
            />
            {/* FIX: Removed duplicate attributes from SVG element. */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>

        {toast && (
          <div className={`p-3 rounded-lg shadow-lg text-white ${toast.type === 'success' ? 'bg-brand-green' : 'bg-brand-red'}`}>
            {toast.message}
          </div>
        )}

        {searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-12 bg-white border rounded-lg shadow-lg z-10">
            {filteredAlunos.length > 0 ? (
              <ul>
                {filteredAlunos.map(aluno => (
                  <li key={aluno.id} className="p-3 hover:bg-slate-100 cursor-pointer border-b last:border-b-0" onClick={() => handleCheckin(aluno)}>
                    <div>
                      <p className="font-semibold">{aluno.nome}</p>
                      <p className="text-sm text-slate-500">{aluno.turma}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-3 text-slate-500">Nenhum aluno encontrado.</p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default CheckinScreen;