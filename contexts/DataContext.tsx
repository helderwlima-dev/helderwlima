import React, { createContext, useState, ReactNode } from 'react';
import { Aluno, AutorizacaoDiaria, Checkin, TipoVinculo, TipoRefeicao } from '../types';
import { getISODate, getISOTime } from '../lib/utils';

interface DataContextType {
  alunos: Aluno[];
  autorizacoes: AutorizacaoDiaria[];
  checkins: Checkin[];
  addAluno: (aluno: Omit<Aluno, 'id'>) => void;
  updateAluno: (aluno: Aluno) => void;
  addAutorizacao: (auth: Omit<AutorizacaoDiaria, 'id'>) => void;
  deleteAutorizacao: (id: string) => void;
  addCheckin: (alunoId: string, tipo_refeicao: TipoRefeicao, tipo_vinculo_no_checkin: TipoVinculo) => void;
  invalidateCheckin: (checkinId: string, motivo: string) => void;
  updateCheckinVinculo: (checkinId: string, newVinculo: TipoVinculo, motivo: string) => void;
  addAlunosBatch: (alunos: Omit<Aluno, 'id'>[]) => void;
  deleteAllAlunos: () => void;
  deleteAllCheckins: () => void;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const initialAlunos: Aluno[] = [];

const initialCheckins: Checkin[] = [];


// FIX: Changed props definition to use React.PropsWithChildren to fix incorrect 'children' prop missing error.
export const DataProvider = ({ children }: React.PropsWithChildren) => {
  const [alunos, setAlunos] = useState<Aluno[]>(initialAlunos);
  const [autorizacoes, setAutorizacoes] = useState<AutorizacaoDiaria[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>(initialCheckins);

  const addAluno = (aluno: Omit<Aluno, 'id'>) => {
    setAlunos(prev => [...prev, { ...aluno, id: crypto.randomUUID() }]);
  };

  const updateAluno = (updatedAluno: Aluno) => {
    setAlunos(prev => prev.map(a => a.id === updatedAluno.id ? updatedAluno : a));
  };
  
  const addAlunosBatch = (newAlunos: Omit<Aluno, 'id'>[]) => {
    const withIds = newAlunos.map(a => ({...a, id: crypto.randomUUID()}));
    setAlunos(prev => [...prev, ...withIds]);
  };

  const deleteAllAlunos = () => {
    setAlunos([]);
  };

  const deleteAllCheckins = () => {
    setCheckins([]);
  };

  const addAutorizacao = (auth: Omit<AutorizacaoDiaria, 'id'>) => {
    setAutorizacoes(prev => [...prev, { ...auth, id: crypto.randomUUID() }]);
  };

  const deleteAutorizacao = (id: string) => {
    setAutorizacoes(prev => prev.filter(auth => auth.id !== id));
  }

  const addCheckin = (alunoId: string, tipo_refeicao: TipoRefeicao, tipo_vinculo_no_checkin: TipoVinculo) => {
    const now = new Date();
    const newCheckin: Checkin = {
      id: crypto.randomUUID(),
      alunoId,
      data_checkin: getISODate(now),
      hora_checkin: getISOTime(now),
      tipo_refeicao,
      tipo_vinculo_no_checkin,
      valido: true,
      motivo_correcao: '',
    };
    setCheckins(prev => [...prev, newCheckin]);
  };

  const invalidateCheckin = (checkinId: string, motivo: string) => {
    setCheckins(prev => prev.map(c => c.id === checkinId ? { ...c, valido: false, motivo_correcao: motivo } : c));
  };

  const updateCheckinVinculo = (checkinId: string, newVinculo: TipoVinculo, motivo: string) => {
    setCheckins(prev => prev.map(c => c.id === checkinId ? { ...c, tipo_vinculo_no_checkin: newVinculo, motivo_correcao: motivo } : c));
  };

  return (
    <DataContext.Provider value={{ alunos, autorizacoes, checkins, addAluno, updateAluno, addAutorizacao, deleteAutorizacao, addCheckin, invalidateCheckin, addAlunosBatch, updateCheckinVinculo, deleteAllAlunos, deleteAllCheckins }}>
      {children}
    </DataContext.Provider>
  );
};