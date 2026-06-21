import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Home from '@/pages/Home';
import Browse from '@/pages/Browse';
import Upload from '@/pages/Upload';
import DownloadCenter from '@/pages/DownloadCenter';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/browse/:category" element={<Browse />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/download" element={<DownloadCenter />} />
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="text-8xl mb-6">🧩</div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">页面走丢了</h1>
                  <p className="text-gray-500 mb-6">别担心，让我们回到贴纸乐园吧~</p>
                  <a
                    href="/"
                    className="px-6 py-3 bg-primary-500 text-white rounded-full font-medium hover:bg-primary-600 transition-colors"
                  >
                    返回首页
                  </a>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
