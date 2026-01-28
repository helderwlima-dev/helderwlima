import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import { getISODate, prettyVinculoName, getVinculoColor } from '../lib/utils';
import { calculateDailyReport, calculateMonthlyReport, ReportData } from '../lib/reportUtils';
import { TipoVinculo, Aluno } from '../types';
import DownloadIcon from '../components/icons/DownloadIcon';

const DailyReport = ({ currentDate, changeDay, setDate, report, totalCombos }) => {
    const ReportCard = ({ vinculo, data }: { vinculo: TipoVinculo, data: ReportData }) => {
        const color = getVinculoColor(vinculo);
        return (
            <div className={`p-4 rounded-lg border-l-4 border-${color}-500 bg-white shadow-sm`}>
                <h3 className={`font-bold text-lg text-${color}-600`}>{prettyVinculoName(vinculo)}</h3>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                    <div><p className="font-bold text-xl">{data.almoco}</p><p className="text-sm text-slate-500">Almoço</p></div>
                    <div><p className="font-bold text-xl">{data.lanche}</p><p className="text-sm text-slate-500">Lanche</p></div>
                    <div><p className="font-bold text-xl">{data.combo}</p><p className="text-sm text-slate-500">Combo</p></div>
                </div>
            </div>
        );
    }
    
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateString = e.target.value;
        if (dateString) {
            // Appending 'T00:00:00' ensures the date is parsed in the local timezone,
            // avoiding issues where new Date('YYYY-MM-DD') might be interpreted as UTC midnight.
            const localDate = new Date(dateString + 'T00:00:00');
            setDate(localDate);
        }
    };


    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center bg-slate-100 p-2 rounded-lg">
                <button onClick={() => changeDay(-1)} className="p-2 rounded-full hover:bg-slate-200" aria-label="Dia anterior">&lt;</button>
                <input
                    type="date"
                    value={getISODate(currentDate)}
                    onChange={handleDateChange}
                    className="font-semibold bg-slate-100 border-none text-slate-800 text-center focus:ring-2 focus:ring-brand-purple rounded-md cursor-pointer"
                    aria-label="Selecionar data"
                />
                <button onClick={() => changeDay(1)} className="p-2 rounded-full hover:bg-slate-200" aria-label="Próximo dia">&gt;</button>
            </div>
             <div className="p-4 rounded-lg bg-brand-purple text-white shadow-md flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Alunos com Combo</h3>
                    <p className="text-sm opacity-90">Lanche da manhã + tarde</p>
                </div>
                <p className="text-4xl font-bold">{totalCombos}</p>
            </div>
            <div className="space-y-3">
                <ReportCard vinculo={TipoVinculo.CONTRATO_MENSAL} data={report[TipoVinculo.CONTRATO_MENSAL]} />
                <ReportCard vinculo={TipoVinculo.DIARIA} data={report[TipoVinculo.DIARIA]} />
                <ReportCard vinculo={TipoVinculo.OBSERVACAO} data={report[TipoVinculo.OBSERVACAO]} />
            </div>
        </div>
    )
}

const MonthlyReport = ({ date, setDate, report, selectedVinculo, setSelectedVinculo }) => {
    const dataForTable = report[selectedVinculo];

    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const years = [2024, 2025, 2026];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <select value={date.getMonth()} onChange={e => setDate(new Date(date.getFullYear(), parseInt(e.target.value), 1))} className="p-2 border rounded-md">
                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select value={date.getFullYear()} onChange={e => setDate(new Date(parseInt(e.target.value), date.getMonth(), 1))} className="p-2 border rounded-md">
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>
            
            <div className="flex justify-around bg-slate-100 p-1 rounded-full">
                {Object.values(TipoVinculo).map(v => (
                    <button key={v} onClick={() => setSelectedVinculo(v)} className={`px-4 py-1 rounded-full text-sm font-semibold transition ${selectedVinculo === v ? `bg-brand-${getVinculoColor(v)} text-white shadow` : 'text-slate-600'}`}>
                        {prettyVinculoName(v)}
                    </button>
                ))}
            </div>

            <div className="bg-white p-4 rounded-lg border">
                <p className="font-semibold mb-2">{dataForTable.length} alunos</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-2">Aluno</th>
                                <th className="p-2">Turma</th>
                                <th className="p-2 text-center">Almoço</th>
                                <th className="p-2 text-center">Lanche</th>
                                <th className="p-2 text-center">Combo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataForTable.map(({aluno, report}) => (
                                <tr key={aluno.id} className="border-b">
                                    <td className="p-2 font-medium">{aluno.nome}</td>
                                    <td className="p-2">{aluno.turma}</td>
                                    <td className="p-2 text-center">{report.almoco}</td>
                                    <td className="p-2 text-center">{report.lanche}</td>
                                    <td className="p-2 text-center">{report.combo}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="font-bold bg-slate-100">
                                <td className="p-2" colSpan={2}>TOTAL</td>
                                <td className="p-2 text-center">{dataForTable.reduce((sum, item) => sum + item.report.almoco, 0)}</td>
                                <td className="p-2 text-center">{dataForTable.reduce((sum, item) => sum + item.report.lanche, 0)}</td>
                                <td className="p-2 text-center">{dataForTable.reduce((sum, item) => sum + item.report.combo, 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    )
}

const CancelledReport = ({ alunos }: { alunos: Aluno[] }) => {
    const cancelledAlunos = useMemo(() => {
        return alunos
            .filter(a => a.tipo_vinculo === TipoVinculo.CANCELADO)
            .sort((a, b) => new Date(b.data_fim_vinculo!).getTime() - new Date(a.data_fim_vinculo!).getTime());
    }, [alunos]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    return (
        <div className="space-y-4">
             <div className="bg-white p-4 rounded-lg border">
                <p className="font-semibold mb-2">{cancelledAlunos.length} alunos com contrato cancelado</p>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-2">Aluno</th>
                                <th className="p-2">Início</th>
                                <th className="p-2">Cancelamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cancelledAlunos.map(aluno => (
                                <tr key={aluno.id} className="border-b">
                                    <td className="p-2">
                                        <p className="font-medium">{aluno.nome}</p>
                                        <p className="text-xs text-slate-500">{aluno.turma}</p>
                                    </td>
                                    <td className="p-2">{formatDate(aluno.data_inicio_vinculo)}</td>
                                    <td className="p-2">{formatDate(aluno.data_fim_vinculo)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
        </div>
    )
};


const ReportsScreen = () => {
    const { checkins, alunos } = useData();
    const [reportType, setReportType] = useState<'daily' | 'monthly' | 'cancelled'>('daily');
    
    // State for daily report
    const [dailyDate, setDailyDate] = useState(new Date());
    const { byVinculo: dailyReportData, totalCombos } = calculateDailyReport(checkins, getISODate(dailyDate));

    // State for monthly report
    const [monthlyDate, setMonthlyDate] = useState(new Date());
    const [selectedVinculo, setSelectedVinculo] = useState<TipoVinculo>(TipoVinculo.CONTRATO_MENSAL);
    const monthlyReportData = calculateMonthlyReport(checkins, alunos, monthlyDate.getFullYear(), monthlyDate.getMonth());

    const changeDailyDay = (amount: number) => {
        setDailyDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + amount);
            return newDate;
        });
    }

    const downloadCSV = (csvContent: string, filename: string) => {
        // Add BOM for better Excel compatibility
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
        if (reportType === 'daily') {
            // Using semicolon as delimiter for better column separation in some spreadsheet software
            let csv = 'Vinculo;Almoco;Lanche;Combo\n';
            Object.values(TipoVinculo).forEach(v => {
                const data = dailyReportData[v];
                csv += `${prettyVinculoName(v)};${data.almoco};${data.lanche};${data.combo}\n`;
            });
            downloadCSV(csv, `relatorio_diario_${getISODate(dailyDate)}.csv`);
        } else if (reportType === 'monthly') {
            const dataForTable = monthlyReportData[selectedVinculo];
            // Using semicolon as delimiter
            let csv = 'Aluno;Turma;Almoco;Lanche;Combo\n';
            dataForTable.forEach(({aluno, report}) => {
                csv += `"${aluno.nome}";"${aluno.turma}";${report.almoco};${report.lanche};${report.combo}\n`;
            });
            const totalAlmoco = dataForTable.reduce((sum, item) => sum + item.report.almoco, 0);
            const totalLanche = dataForTable.reduce((sum, item) => sum + item.report.lanche, 0);
            const totalCombo = dataForTable.reduce((sum, item) => sum + item.report.combo, 0);
            csv += `TOTAL;"";${totalAlmoco};${totalLanche};${totalCombo}\n`;
            
            const monthName = monthlyDate.toLocaleString('pt-BR', { month: 'long' });
            downloadCSV(csv, `relatorio_mensal_${monthName}_${monthlyDate.getFullYear()}_${selectedVinculo}.csv`);
        } else { // Cancelled Report
            const cancelledAlunos = alunos.filter(a => a.tipo_vinculo === TipoVinculo.CANCELADO);
            let csv = 'Aluno;Turma;Data Inicio Contrato;Data Fim Contrato;Observacoes\n';
            cancelledAlunos.forEach(aluno => {
                 // Replace newlines in observation with spaces for CSV compatibility
                const obs = aluno.observacao.replace(/\r?\n|\r/g, " ");
                csv += `"${aluno.nome}";"${aluno.turma}";${aluno.data_inicio_vinculo || ''};${aluno.data_fim_vinculo || ''};"${obs}"\n`;
            });
            downloadCSV(csv, `relatorio_cancelados_${getISODate(new Date())}.csv`);
        }
    };

    return (
        <div className="space-y-4">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Relatórios</h1>
                <button onClick={handleExportCSV} className="p-2 bg-slate-100 text-slate-600 rounded-lg shadow-sm hover:bg-slate-200 transition">
                    <DownloadIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="flex justify-center bg-slate-200 p-1 rounded-full">
                <button onClick={() => setReportType('daily')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${reportType === 'daily' ? 'bg-white shadow' : ''}`}>Diário</button>
                <button onClick={() => setReportType('monthly')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${reportType === 'monthly' ? 'bg-white shadow' : ''}`}>Mensal</button>
                <button onClick={() => setReportType('cancelled')} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${reportType === 'cancelled' ? 'bg-white shadow' : ''}`}>Cancelados</button>
            </div>
            {reportType === 'daily' ? (
                 <DailyReport currentDate={dailyDate} changeDay={changeDailyDay} setDate={setDailyDate} report={dailyReportData} totalCombos={totalCombos} />
            ) : reportType === 'monthly' ? (
                <MonthlyReport date={monthlyDate} setDate={setMonthlyDate} report={monthlyReportData} selectedVinculo={selectedVinculo} setSelectedVinculo={setSelectedVinculo} />
            ) : (
                <CancelledReport alunos={alunos} />
            )}
        </div>
    );
};

export default ReportsScreen;