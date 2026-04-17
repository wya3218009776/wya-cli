import WelcomeCard from './components/WelcomeCard.jsx';

function App() {
  return (
    <main className="app">
      <WelcomeCard
        title={'<%= projectName %>'}
        version={'<%= projectVersion %>'}
      />
    </main>
  );
}

export default App;
