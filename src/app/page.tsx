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
      
      <footer className="mt-16 py-6 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SNOI DevHub
          </p>
          <p className="mt-2 text-sm text-slate-500">
            <a 
              href="https://github.com/snoiclub/rekomendasi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-700 underline transition-colors"
            >
              GitHub Repository
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

