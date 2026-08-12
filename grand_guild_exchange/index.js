const container = document.getElementById('root');
function mountGuildExchange() {
  if (!container) return;
  const App = window.GuildExchange;
  if (typeof App !== 'function') {
    return setTimeout(mountGuildExchange, 50);
  }
  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(App));
}
mountGuildExchange();
