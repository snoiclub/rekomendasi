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
      <div className="max-w-5xl mx-auto rounded-xl border border-slate-100 bg-white/95 p-6 sm:p-10 shadow-2xl shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600">Result</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Rekomendasi Scooter untuk Anda</h1>
            <p className="mt-2 text-slate-500">Top 3 Ninebot yang paling sesuai berdasarkan jawaban quiz dan preferensi harian Anda.</p>
          </div>
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentStep(0);
              setAnswers({});
            }}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            Ubah Jawaban
          </button>
        </div>
        
        {recommendations.map((result, index) => (
          <div key={result.scooter.id} className="mb-8 rounded-lg border border-slate-100 bg-white p-6 lg:p-7 shadow-xl shadow-slate-900/5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Match #{index + 1}</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{result.scooter.name}</h2>
                <p className="text-slate-500">{result.scooter.brand}</p>
              </div>
              <div className="flex items-baseline gap-2 text-slate-900">
                <span className="text-3xl font-semibold">{result.score.toFixed(1)}</span>
                <span className="text-sm text-slate-400">/100</span>
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

            <div className="grid gap-4 sm:grid-cols-3 text-sm">
              {[
                { label: 'Range', value: result.scooter.max_range_km ? `${result.scooter.max_range_km} km` : '-' },
                { label: 'Kecepatan', value: result.scooter.max_speed_kmh ? `${result.scooter.max_speed_kmh} km/h` : '-' },
                { label: 'Berat Unit', value: result.scooter.unit_weight_kg ? `${result.scooter.unit_weight_kg} kg` : '-' },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-4 bg-slate-50/50">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
          </div>
        ))}

        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-10">
            <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl border border-slate-100 bg-white p-6 sm:p-10 shadow-2xl shadow-slate-900/40">
              <button
                onClick={() => setSelectedResult(null)}
                className="fixed top-6 right-6 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition shadow-lg"
              >
                ✕
              </button>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">Detail Lengkap</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-900">{selectedResult.scooter.name}</h2>
                  <p className="text-slate-500">{selectedResult.scooter.brand}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-slate-900">
                    {selectedResult.score.toFixed(1)}
                    <span className="text-base text-slate-400">/100</span>
                  </div>
                </div>
              </div>

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
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-lg border border-indigo-50 bg-indigo-50/50 p-5">
                <h3 className="font-semibold text-indigo-900 mb-2">✅ Alasan Cocok</h3>
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
                <h3 className="font-semibold mb-3 text-lg text-slate-900">📊 Spesifikasi Teknis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    { label: 'Battery Capacity', value: selectedResult.scooter.battery_capacity_wh ? `${selectedResult.scooter.battery_capacity_wh} Wh` : '-' },
                    { label: 'Motor Power (Nominal)', value: selectedResult.scooter.motor_power_nominal_w ? `${selectedResult.scooter.motor_power_nominal_w} W` : '-' },
                    { label: 'Motor Power (Max)', value: selectedResult.scooter.motor_power_max_w ? `${selectedResult.scooter.motor_power_max_w} W` : '-' },
                    { label: 'Max Speed', value: selectedResult.scooter.max_speed_kmh ? `${selectedResult.scooter.max_speed_kmh} km/h` : '-' },
                    { label: 'Max Range', value: selectedResult.scooter.max_range_km ? `${selectedResult.scooter.max_range_km} km` : '-' },
                    { label: 'Max Driver Weight', value: selectedResult.scooter.max_driver_weight_kg ? `${selectedResult.scooter.max_driver_weight_kg} kg` : '-' },
                    { label: 'Unit Weight', value: selectedResult.scooter.unit_weight_kg ? `${selectedResult.scooter.unit_weight_kg} kg` : '-' },
                    { label: 'Foldable', value: selectedResult.scooter.foldable ? 'Ya' : 'Tidak' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-slate-100 p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                      <p className="mt-2 text-base font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6 text-sm">
                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">🛑 Sistem Rem</p>
                  <p className="mt-2 text-slate-500 text-xs uppercase">Depan</p>
                  <p className="text-base font-semibold text-slate-900 capitalize">{selectedResult.scooter.front_brake.replace(/_/g, ' ')}</p>
                  <p className="mt-4 text-slate-500 text-xs uppercase">Belakang</p>
                  <p className="text-base font-semibold text-slate-900 capitalize">{selectedResult.scooter.rear_brake.replace(/_/g, ' ')}</p>
                </div>
                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">🛞 Ban & Suspensi</p>
                  <p className="mt-2 text-slate-500 text-xs uppercase">Ukuran & Tipe Ban</p>
                  <p className="text-base font-semibold text-slate-900">
                    {selectedResult.scooter.tire_size_inch ? `${selectedResult.scooter.tire_size_inch}"` : '-'} • {selectedResult.scooter.tire_type.replace(/_/g, ' ')}
                  </p>
                  <p className="mt-4 text-slate-500 text-xs uppercase">Suspensi</p>
                  <p className="text-base font-semibold text-slate-900 capitalize">
                    {selectedResult.scooter.suspension === 'none' ? 'Tidak ada' : selectedResult.scooter.suspension.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-6 text-sm">
                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">IP Body</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedResult.scooter.ip_body || '-'}</p>
                </div>
                <div className="rounded-lg border border-slate-100 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">IP Battery</p>
                  <p className="mt-1 text-base font-semibold text-slate-900">{selectedResult.scooter.ip_battery || '-'}</p>
                </div>
              </div>

              {(selectedResult.scooter.dimensions_open_mm || selectedResult.scooter.dimensions_folded_mm) && (
                <div className="mb-6 rounded-lg border border-slate-100 p-4 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-400">📐 Dimensi</p>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {selectedResult.scooter.dimensions_open_mm && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase">Terbuka</p>
                        <p className="font-semibold text-slate-900">{selectedResult.scooter.dimensions_open_mm}</p>
                      </div>
                    )}
                    {selectedResult.scooter.dimensions_folded_mm && (
                      <div>
                        <p className="text-slate-400 text-xs uppercase">Terlipat</p>
                        <p className="font-semibold text-slate-900">{selectedResult.scooter.dimensions_folded_mm}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6 rounded-lg border border-slate-100 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">🔧 Official Service</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedResult.scooter.official_service ? 'Tersedia di jaringan resmi Segway' : 'Hubungi distributor independen'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedResult.scooter.pros.length > 0 && (
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
                    <h3 className="font-semibold mb-2 text-emerald-900">✅ Kelebihan</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-emerald-900/80">
                      {selectedResult.scooter.pros.map((pro, i) => (
                        <li key={i}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {selectedResult.scooter.cons.length > 0 && (
                  <div className="rounded-lg border border-rose-100 bg-rose-50/80 p-4">
                    <h3 className="font-semibold mb-2 text-rose-900">❌ Kekurangan</h3>
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-600">
              Pertanyaan {currentStep + 1} / {allQuestions.length}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{currentQuestion.question}</h2>
            {currentQuestion.description && <p className="mt-2 text-slate-500">{currentQuestion.description}</p>}
          </div>
          <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            {progress}% selesai
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-slate-100 mb-6">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 transition-all"
            style={{ width: `${progress}%` }}
          />
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
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selected ? 'border-white bg-white text-slate-900' : 'border-slate-300 text-transparent'
                    }`}
                  >
                    {selected && '✓'}
                  </span>
                  <div>
                    <p className={`text-base font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>{option.label}</p>
                    {option.value && (
                      <p className={`text-sm ${selected ? 'text-white/70' : 'text-slate-500'}`}>
                        {currentQuestion.type === 'single' ? 'Klik untuk memilih opsi ini' : 'Klik untuk menambah/kurangi pilihan'}
                      </p>
                    )}
                  </div>
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

