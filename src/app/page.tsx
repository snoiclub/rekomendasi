import Recommendation from '@/components/Recommendation';

export default function Home() {
  return (
    <main className="bg-slate-50 min-h-screen py-12">
      <section id="quiz" className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-slate-900">Rekomendasi SNOI</h1>
          <p className="mt-2 text-slate-500">
            Pilih scooter untuk kebutuhan harianmu
          </p>
        </div>
        <Recommendation />
      </section>
    </main>
  );
}

