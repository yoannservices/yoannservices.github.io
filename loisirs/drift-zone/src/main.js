
try {
  window.game = startGame(); // accès console (debug)
} catch (err) {
  console.error(err);
  document.getElementById('card').innerHTML = `<h1>Erreur</h1><p>${err.message}</p><p style="font-size:12px">WebGL est-il activé dans le navigateur ?</p>`;
}
