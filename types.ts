export enum TipoVinculo {
  CONTRATO_MENSAL = 'contrato_mensal',
  DIARIA = 'diaria',
  OBSERVACAO = 'observacao',
  CANCELADO = 'cancelado',
}

export enum TipoRefeicao {
  LANCHE_MANHA = 'lanche_manha',
  ALMOCO = 'almoço',
  LANCHE_TARDE = 'lanche_tarde',
}

export interface Aluno {
  id: string;
  nome: string;
  turma: string;
  tipo_vinculo: TipoVinculo;
  data_inicio_vinculo: string | null;
  data_fim_vinculo: string | null;
  observacao: string;
}

export interface AutorizacaoDiaria {
  id: string;
  alunoId: string;
  data_autorizada: string;
  observacao: string;
}

export interface Checkin {
  id: string;
  alunoId: string;
  data_checkin: string;
  hora_checkin: string;
  tipo_refeicao: TipoRefeicao;
  tipo_vinculo_no_checkin: TipoVinculo;
  valido: boolean;
  motivo_correcao: string;
}