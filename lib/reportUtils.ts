import { Aluno, Checkin, TipoRefeicao, TipoVinculo } from "../types";

export interface ReportData {
  almoco: number;
  lanche: number;
  combo: number;
}

export const calculateStudentReportForDay = (
  studentCheckins: Checkin[]
): ReportData => {
  const validCheckins = studentCheckins.filter(c => c.valido);

  const almoco = validCheckins.filter(
    (c) => c.tipo_refeicao === TipoRefeicao.ALMOCO
  ).length;

  const lanchesManhaCount = validCheckins.filter(
    (c) => c.tipo_refeicao === TipoRefeicao.LANCHE_MANHA
  ).length;

  const lanchesTardeCount = validCheckins.filter(
    (c) => c.tipo_refeicao === TipoRefeicao.LANCHE_TARDE
  ).length;

  // Um combo é formado por um lanche da manhã e um lanche da tarde no mesmo dia para o mesmo aluno.
  // Contamos o número de pares possíveis.
  const combo = Math.min(lanchesManhaCount, lanchesTardeCount);

  // Os lanches que não formaram um combo são contados individualmente.
  // Ex: 2 lanches da manhã e 1 da tarde = 1 combo e 1 lanche (da manhã) sobrando.
  const lanche = (lanchesManhaCount - combo) + (lanchesTardeCount - combo);


  return { almoco, lanche, combo };
};


export const calculateDailyReport = (checkins: Checkin[], day: string) => {
    const dailyCheckins = checkins.filter(c => c.data_checkin === day && c.valido);
    
    const uniqueStudentIds = [...new Set(dailyCheckins.map(c => c.alunoId))];
    let totalCombos = 0;
    uniqueStudentIds.forEach(id => {
        const studentCheckinsForDay = dailyCheckins.filter(c => c.alunoId === id);
        const hasLancheManha = studentCheckinsForDay.some(c => c.tipo_refeicao === TipoRefeicao.LANCHE_MANHA);
        const hasLancheTarde = studentCheckinsForDay.some(c => c.tipo_refeicao === TipoRefeicao.LANCHE_TARDE);

        if (hasLancheManha && hasLancheTarde) {
            totalCombos++;
        }
    });

    const byVinculo: Record<TipoVinculo, Checkin[]> = {
        [TipoVinculo.CONTRATO_MENSAL]: dailyCheckins.filter(c => c.tipo_vinculo_no_checkin === TipoVinculo.CONTRATO_MENSAL),
        [TipoVinculo.DIARIA]: dailyCheckins.filter(c => c.tipo_vinculo_no_checkin === TipoVinculo.DIARIA),
        [TipoVinculo.OBSERVACAO]: dailyCheckins.filter(c => c.tipo_vinculo_no_checkin === TipoVinculo.OBSERVACAO),
        // FIX: Added missing CANCELADO property to satisfy the Record<TipoVinculo, ...> type.
        [TipoVinculo.CANCELADO]: dailyCheckins.filter(c => c.tipo_vinculo_no_checkin === TipoVinculo.CANCELADO),
    }

    const report: Record<TipoVinculo, ReportData> = {
        [TipoVinculo.CONTRATO_MENSAL]: { almoco: 0, lanche: 0, combo: 0 },
        [TipoVinculo.DIARIA]: { almoco: 0, lanche: 0, combo: 0 },
        [TipoVinculo.OBSERVACAO]: { almoco: 0, lanche: 0, combo: 0 },
        [TipoVinculo.CANCELADO]: { almoco: 0, lanche: 0, combo: 0 },
    };

    for (const vinculo in byVinculo) {
        const checkinsForVinculo = byVinculo[vinculo as TipoVinculo];
        const studentIds = [...new Set(checkinsForVinculo.map(c => c.alunoId))];

        let totalAlmoco = 0;
        let totalLanche = 0;
        let totalCombo = 0;

        studentIds.forEach(id => {
            const studentCheckins = checkinsForVinculo.filter(c => c.alunoId === id);
            const studentReport = calculateStudentReportForDay(studentCheckins);
            totalAlmoco += studentReport.almoco;
            totalLanche += studentReport.lanche;
            totalCombo += studentReport.combo;
        });

        report[vinculo as TipoVinculo] = { almoco: totalAlmoco, lanche: totalLanche, combo: totalCombo };
    }

    return { byVinculo: report, totalCombos };
}

export const calculateMonthlyReport = (checkins: Checkin[], alunos: Aluno[], year: number, month: number) => {
    const monthlyCheckins = checkins.filter(c => {
        const checkinDate = new Date(c.data_checkin + 'T00:00:00');
        return c.valido && checkinDate.getFullYear() === year && checkinDate.getMonth() === month;
    });

    const reportByVinculo: Record<TipoVinculo, {aluno: Aluno, report: ReportData}[]> = {
        [TipoVinculo.CONTRATO_MENSAL]: [],
        [TipoVinculo.DIARIA]: [],
        [TipoVinculo.OBSERVACAO]: [],
        // FIX: Added missing CANCELADO property to satisfy the Record<TipoVinculo, ...> type.
        [TipoVinculo.CANCELADO]: [],
    }

    const processedAlunos = new Set<string>();

    monthlyCheckins.forEach(checkin => {
        if(processedAlunos.has(`${checkin.alunoId}-${checkin.tipo_vinculo_no_checkin}`)) return;

        const aluno = alunos.find(a => a.id === checkin.alunoId);
        if(!aluno) return;

        const alunoCheckinsThisMonthForVinculo = monthlyCheckins.filter(c => c.alunoId === aluno.id && c.tipo_vinculo_no_checkin === checkin.tipo_vinculo_no_checkin);
        
        const checkinsByDay: Record<string, Checkin[]> = {};
        alunoCheckinsThisMonthForVinculo.forEach(c => {
            if(!checkinsByDay[c.data_checkin]) {
                checkinsByDay[c.data_checkin] = [];
            }
            checkinsByDay[c.data_checkin].push(c);
        });

        const monthlyReport: ReportData = { almoco: 0, lanche: 0, combo: 0 };
        Object.values(checkinsByDay).forEach(dayCheckins => {
            const dayReport = calculateStudentReportForDay(dayCheckins);
            monthlyReport.almoco += dayReport.almoco;
            monthlyReport.lanche += dayReport.lanche;
            monthlyReport.combo += dayReport.combo;
        });
        
        reportByVinculo[checkin.tipo_vinculo_no_checkin].push({ aluno, report: monthlyReport });
        processedAlunos.add(`${checkin.alunoId}-${checkin.tipo_vinculo_no_checkin}`);
    });

    return reportByVinculo;
}