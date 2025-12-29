import { useAppContext } from './context/AppContext';

// Components
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CharacterListView } from './components/character/CharacterListView';
import { CharacterSheetView } from './components/character/CharacterSheetView';

function App() {
  const {
    view,
    theme
  } = useAppContext();

  if (view === 'list') {
    return <CharacterListView />;
  }

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[var(--bg-app)] text-white dark' : 'bg-[var(--bg-app)] text-[var(--text-primary)] light-theme'}`}>
      <Navbar />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 focus:outline-none">
        <CharacterSheetView />
      </div>

      <Footer />
    </div>
  );
}

export default App;
