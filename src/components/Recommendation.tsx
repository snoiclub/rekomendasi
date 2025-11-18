'use client';

import Image from 'next/image';
import { useState } from 'react';
import { QUIZ_QUESTIONS, QuizAnswers } from '../data/quiz-questions';
import { SCOOTERS } from '../data/scooters';
import { calculateScores, getTopRecommendations, ScoreResult } from '../utils/scoring';

export default function Recommendation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [recommendations, setRecommendations] = useState<ScoreResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState<ScoreResult | null>(null);

  const allQuestions = QUIZ_QUESTIONS;
  const currentQuestion = allQuestions[currentStep];

  const handleAnswer = (value: string) => {
    const newAnswers = { ...answers };
    
    if (currentQuestion.type === 'multiple') {
      const currentValues = (newAnswers[currentQuestion.id] as string[]) || [];
      if (currentValues.includes(value)) {
        newAnswers[currentQuestion.id] = currentValues.filter(v => v !== value);
      } else {
        newAnswers[currentQuestion.id] = [...currentValues, value];
      }
    } else {
      newAnswers[currentQuestion.id] = value;
    }
    
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentStep < allQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Calculate recommendations
      const results = calculateScores(answers, SCOOTERS);
      const top3 = getTopRecommendations(results, 3);
      setRecommendations(top3);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isAnswerSelected = (value: string): boolean => {
    if (currentQuestion.type === 'multiple') {
      const currentValues = (answers[currentQuestion.id] as string[]) || [];
      return currentValues.includes(value);
    }
    return answers[currentQuestion.id] === value;
  };

  const canProceed = (): boolean => {
    if (currentQuestion.type === 'multiple') {
      const currentValues = (answers[currentQuestion.id] as string[]) || [];
      return currentValues.length > 0;
    }
    return !!answers[currentQuestion.id];
  };

  const progress = Math.round(((currentStep + 1) / allQuestions.length) * 100);

  if (showResults) {
    return (
      <div className="relative -mx-6 sm:mx-auto w-[calc(100%+3rem)] sm:w-full sm:max-w-5xl sm:rounded-xl border border-slate-100 bg-white/95 p-6 sm:p-10 shadow-2xl shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600">Result</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Rekomendasi Scooter untuk kamu</h1>
            <p className="mt-2 text-slate-500">Top 3 Ninebot yang paling sesuai berdasarkan jawaban quiz dan preferensi harian kamu.</p>
          </div>
        </div>
        
        {recommendations.map((result, index) => (
          <div key={result.scooter.id} className="mb-8 rounded-lg border border-slate-100 bg-white p-6 lg:p-7 shadow-xl shadow-slate-900/5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Match #{index + 1}</p>
              <div className="flex items-center justify-between mt-2 lg:block">
                <h2 className="text-2xl font-semibold text-slate-900">{result.scooter.name}</h2>
                <div className="flex items-center gap-2 text-slate-900 lg:mt-4 lg:justify-end">
                  <span className="text-3xl font-semibold">{Math.round(result.score)}</span>
                  <span className="text-sm text-slate-400">/100</span>
                </div>
              </div>
            </div>

            {result.scooter.image_url && (
              <div className="mt-6 mb-6">
                <div className="relative w-full h-48 rounded-xl border border-slate-100 bg-slate-50">
                  <Image
                    src={result.scooter.image_url}
                    alt={result.scooter.name}
                    fill
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Alasan utama</p>
                <ul className="mt-2 text-sm text-slate-600 space-y-1">
                  {result.reasons.slice(0, 2).map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400" />
                      <span>{reason}</span>
                    </li>
                  ))}
                  {result.reasons.length === 0 && <li className="text-slate-400">Belum ada ringkasan alasan.</li>}
                </ul>
              </div>
              {result.warnings.length > 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                  ⚠️ {result.warnings[0]}
                </p>
              )}
              <button
                onClick={() => setSelectedResult(result)}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-white font-semibold shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition"
              >
                Lihat detail lengkap
              </button>
            </div>
          </div>
        ))}

        {selectedResult && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-slate-900/70"
              onClick={() => setSelectedResult(null)}
            />
            <div 
              className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto pointer-events-none"
              role="dialog"
              tabIndex={-1}
              aria-labelledby="modal-title"
            >
              <div className="mt-7 opacity-100 duration-500 ease-out transition-all sm:max-w-4xl sm:w-full h-[calc(100%-56px)] sm:mx-auto m-3">
                <div className="max-h-full overflow-hidden flex flex-col bg-white border border-gray-200 shadow-2xl rounded-xl pointer-events-auto">
                  <div className="flex justify-between items-center py-3 px-4 border-b border-gray-200">
                    <h3 id="modal-title" className="font-bold text-gray-800">
                      {selectedResult.scooter.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedResult(null)}
                      className="size-8 inline-flex justify-center items-center gap-x-2 rounded-full border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none focus:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                      aria-label="Close"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"/>
                        <path d="m6 6 12 12"/>
                      </svg>
                    </button>
                  </div>

                  <div className="p-4 overflow-y-auto">
                    {selectedResult.scooter.image_url && (
                      <div className="mb-6">
                        <div className="relative w-full h-64 rounded-xl border border-slate-100 bg-slate-50">
                          <Image
                            src={selectedResult.scooter.image_url}
                            alt={selectedResult.scooter.name}
                            fill
                            className="object-contain p-6"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-4 py-2 border border-slate-200">
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-semibold text-slate-900">{Math.round(selectedResult.score)}</span>
                              <span className="text-sm text-slate-400">/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-6 rounded-lg border border-indigo-50 bg-indigo-50/50 p-5">
                      <h3 className="font-semibold text-indigo-900 mb-2">Alasan Cocok</h3>
                      <ul className="grid gap-3 text-sm text-indigo-900/80 md:grid-cols-2">
                        {selectedResult.reasons.map((reason, i) => (
                          <li key={i} className="inline-flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {selectedResult.warnings.length > 0 && (
                      <div className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-5">
                        <h3 className="font-semibold mb-2 text-amber-900">⚠️ Peringatan:</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-amber-900/80">
                          {selectedResult.warnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedResult.scooter.description && (
                      <div className="mb-6">
                        <p className="text-slate-600">{selectedResult.scooter.description}</p>
                      </div>
                    )}

                    <div className="mb-6">
                      <h3 className="font-semibold mb-4 text-lg text-slate-900">Spesifikasi Teknis</h3>
                      <div className="space-y-4">
                        {/* Battery */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Battery</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Battery Capacity</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.battery_capacity_wh ? `${selectedResult.scooter.battery_capacity_wh} Wh` : '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Motor */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Motor</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Motor Power Nominal</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.motor_power_nominal_w ? `${selectedResult.scooter.motor_power_nominal_w} W` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Motor Power Max</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.motor_power_max_w ? `${selectedResult.scooter.motor_power_max_w} W` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Max Speed</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.max_speed_kmh ? `${selectedResult.scooter.max_speed_kmh} km/h` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Max Range</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.max_range_km ? `${selectedResult.scooter.max_range_km} km` : '-'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Rem */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Rem</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Depan</p>
                              <p className="text-base font-semibold text-slate-900 capitalize">
                                {selectedResult.scooter.front_brake.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Belakang</p>
                              <p className="text-base font-semibold text-slate-900 capitalize">
                                {selectedResult.scooter.rear_brake.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Ban & Suspensi */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Ban & Suspensi</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Ukuran dan Tipe Ban</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.tire_size_inch ? `${selectedResult.scooter.tire_size_inch}"` : '-'} • {selectedResult.scooter.tire_type.replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Suspensi</p>
                              <p className="text-base font-semibold text-slate-900 capitalize">
                                {selectedResult.scooter.suspension === 'none' ? 'Tidak ada' : selectedResult.scooter.suspension.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* IP */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">IP</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Body</p>
                              <p className="text-base font-semibold text-slate-900">{selectedResult.scooter.ip_body || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Battery</p>
                              <p className="text-base font-semibold text-slate-900">{selectedResult.scooter.ip_battery || '-'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Ukuran */}
                        <div className="rounded-lg border border-slate-100 p-4">
                          <h4 className="font-semibold text-sm text-slate-900 mb-3">Ukuran</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Max Payload</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.max_payload_kg ? `${selectedResult.scooter.max_payload_kg} kg` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 uppercase">Unit Weight</p>
                              <p className="text-base font-semibold text-slate-900">
                                {selectedResult.scooter.unit_weight_kg ? `${selectedResult.scooter.unit_weight_kg} kg` : '-'}
                              </p>
                            </div>
                            {selectedResult.scooter.dimensions_open_mm && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase">Dimensi Terbuka</p>
                                <p className="text-base font-semibold text-slate-900">{selectedResult.scooter.dimensions_open_mm}</p>
                              </div>
                            )}
                            {selectedResult.scooter.dimensions_folded_mm && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase">Dimensi Terlipat</p>
                                <p className="text-base font-semibold text-slate-900">{selectedResult.scooter.dimensions_folded_mm}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6 rounded-lg border border-slate-100 p-4 text-sm">
                      <p className="text-xs uppercase tracking-wide text-slate-400">Official Service</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedResult.scooter.official_service ? 'Tersedia di jaringan resmi Segway' : 'Hubungi distributor independen'}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedResult.scooter.pros.length > 0 && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
                          <h3 className="font-semibold mb-2 text-emerald-900">Kelebihan</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900/80">
                            {selectedResult.scooter.pros.map((pro, i) => (
                              <li key={i}>{pro}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedResult.scooter.cons.length > 0 && (
                        <div className="rounded-lg border border-rose-100 bg-rose-50/80 p-4">
                          <h3 className="font-semibold mb-2 text-rose-900">Kekurangan</h3>
                          <ul className="list-disc list-inside space-y-1 text-sm text-rose-900/80">
                            {selectedResult.scooter.cons.map((con, i) => (
                              <li key={i}>{con}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-10 text-center">
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              setAnswers({});
            }}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-white font-semibold shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-all"
          >
            Mulai Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:max-w-4xl sm:mx-auto space-y-6">
      <div className="relative -mx-6 sm:mx-0 w-[calc(100%+3rem)] sm:w-full sm:rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2.5 rounded-full bg-slate-100">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            {currentStep + 1}/{allQuestions.length}
          </span>
        </div>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">{currentQuestion.question}</h2>
          {currentQuestion.description && <p className="mt-2 text-slate-500">{currentQuestion.description}</p>}
        </div>

        <div className="grid gap-3">
          {currentQuestion.options.map((option) => {
            const selected = isAnswerSelected(option.value);
            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.value)}
                className={`group relative block rounded-lg border-2 px-5 py-4 text-left transition-all ${
                  selected
                    ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className={`text-base font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>{option.label}</p>
                  {option.value && (
                    <p className={`text-sm ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                      {currentQuestion.type === 'single' ? 'Klik untuk memilih opsi ini' : 'Klik untuk menambah/kurangi pilihan'}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-row items-center justify-between gap-3">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-slate-300 hover:bg-slate-50 transition flex-1 sm:flex-none"
          >
            Kembali
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-8 py-3 text-white font-semibold shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
          >
            {currentStep === allQuestions.length - 1 ? 'Lihat Hasil' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
}

