import { TipoRefeicao, TipoVinculo } from '../types';

export const getTipoRefeicao = (date: Date): TipoRefeicao => {
  const hours = date.getHours();
  if (hours >= 7 && hours < 10) {
    return TipoRefeicao.LANCHE_MANHA;
  }
  if (hours >= 10 && hours < 13) {
    return TipoRefeicao.ALMOCO;
  }
  return TipoRefeicao.LANCHE_TARDE;
};

export const formatarData = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const getISODate = (date: Date): string => {
  return date.toISOString().split('T')[0];
}

export const getISOTime = (date: Date): string => {
  return date.toTimeString().split(' ')[0];
}


export const prettyVinculoName = (vinculo: TipoVinculo): string => {
    switch (vinculo) {
        case TipoVinculo.CONTRATO_MENSAL: return 'Contrato Mensal';
        case TipoVinculo.DIARIA: return 'Diária';
        case TipoVinculo.OBSERVACAO: return 'Observação';
        case TipoVinculo.CANCELADO: return 'Cancelado';
    }
}

export const prettyRefeicaoName = (refeicao: TipoRefeicao): string => {
    switch (refeicao) {
        case TipoRefeicao.ALMOCO: return 'Almoço';
        case TipoRefeicao.LANCHE_MANHA: return 'Lanche Manhã';
        case TipoRefeicao.LANCHE_TARDE: return 'Lanche Tarde';
    }
}

export const getVinculoColor = (vinculo: TipoVinculo): string => {
    switch(vinculo) {
        case TipoVinculo.CONTRATO_MENSAL: return 'green';
        case TipoVinculo.DIARIA: return 'blue';
        case TipoVinculo.OBSERVACAO: return 'yellow';
        case TipoVinculo.CANCELADO: return 'red';
    }
}