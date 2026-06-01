import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MapViewer from './pages/MapViewer';
import MapEditor from './pages/MapEditor';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapViewer />} />
        <Route path="/editor" element={<MapEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
