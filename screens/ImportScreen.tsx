import React, { useState } from 'react';
import { useData } from '../hooks/useData';
import { TipoVinculo, Aluno } from '../types';
import { prettyVinculoName } from '../lib/utils';

const ImportScreen = () => {
    const { addAlunosBatch, alunos } = useData();
    const [vinculo, setVinculo] = useState<TipoVinculo>(TipoVinculo.CONTRATO_MENSAL);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            processCSV(text);
        };
        reader.readAsText(file);
    };

    const processCSV = (csvText: string) => {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if(lines.length <= 1) {
            setFeedback({message: 'Arquivo CSV vazio ou com apenas cabeçalho.', type: 'error'});
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIndex = headers.indexOf('nome');
        const turmaIndex = headers.indexOf('turma');
        
        if (nameIndex === -1) {
            setFeedback({message: 'A coluna "Nome" não foi encontrada no arquivo CSV.', type: 'error'});
            return;
        }
         if (turmaIndex === -1) {
            setFeedback({message: 'A coluna "Turma" não foi encontrada no arquivo CSV.', type: 'error'});
            return;
        }
        
        const newAlunos: Omit<Aluno, 'id'>[] = lines.slice(1).map(line => {
            const values = line.split(',');
            const nome = values[nameIndex]?.trim() || '';
            const turma = values[turmaIndex]?.trim() || '';
            return {
                nome,
                turma,
                tipo_vinculo: vinculo,
                data_inicio_vinculo: vinculo === TipoVinculo.CONTRATO_MENSAL ? new Date().toISOString().split('T')[0] : null,
                data_fim_vinculo: null,
                observacao: `Importado em ${new Date().toLocaleDateString()}`
            };
        }).filter(a => a.nome && a.turma);

        if(newAlunos.length > 0) {
            addAlunosBatch(newAlunos);
            setFeedback({message: `${newAlunos.length} alunos importados com sucesso!`, type: 'success'});
        } else {
            setFeedback({message: 'Nenhum aluno válido para importar.', type: 'error'});
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Nome,Turma\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "modelo_importacao_alunos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const alunosPorVinculo = alunos.reduce((acc, aluno) => {
        acc[aluno.tipo_vinculo] = (acc[aluno.tipo_vinculo] || 0) + 1;
        return acc;
    }, {} as Record<TipoVinculo, number>);


    return (
        <div className="space-y-6">
            <header className="text-center">
                <h1 className="text-2xl font-bold">Importar Alunos</h1>
                <p className="text-slate-500">Importação em massa via planilha</p>
            </header>

             {feedback && (
                <div className={`p-3 rounded-lg text-white ${feedback.type === 'success' ? 'bg-brand-green' : 'bg-brand-red'}`}>
                    {feedback.message}
                </div>
            )}

            <div className="bg-white p-4 rounded-lg border space-y-2">
                <label className="block text-sm font-medium text-slate-600">Tipo de vínculo para importação</label>
                <select value={vinculo} onChange={(e) => setVinculo(e.target.value as TipoVinculo)} className="w-full p-2 border rounded-md">
                    {Object.values(TipoVinculo).map(v => <option key={v} value={v}>{prettyVinculoName(v)}</option>)}
                </select>
            </div>
            
            <div className="bg-white p-6 rounded-lg border text-center">
                 <label htmlFor="csv-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 hover:bg-slate-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <p className="mt-2 font-semibold text-brand-purple">Importar alunos</p>
                        <p className="text-sm text-slate-500">Excel ou CSV com colunas: Nome, Turma</p>
                    </div>
                </label>
                <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                <button onClick={downloadTemplate} className="mt-4 text-sm text-brand-blue hover:underline">Baixar modelo</button>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">Alunos por Vínculo <span className="text-sm text-slate-500 font-normal">({alunos.length} total)</span></h3>
                <div className="space-y-2">
                    {Object.entries(alunosPorVinculo).map(([v, count]) => (
                        <div key={v} className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-600">{prettyVinculoName(v as TipoVinculo)}</span>
                            <span className="font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ImportScreen;
