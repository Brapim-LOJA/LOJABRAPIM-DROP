// Depoimentos rodando: 3 por vez no computador, 1 no celular, troca a cada 5s
import wixWindow from 'wix-window-frontend';

$w.onReady(function () {
  const ds = $w('#depoimentosDataset');
  const lista = $w('#repeaterDepoimentos');
  ds.onReady(async () => {
    if (wixWindow.formFactor === 'Mobile') await ds.setPageSize(1);
    setInterval(async () => {
      try {
        await lista.hide('fade', { duration: 300 });
        if (ds.hasNextPage()) await ds.nextPage();
        else await ds.loadPage(1);
        await lista.show('fade', { duration: 300 });
      } catch (err) {
        lista.show();
      }
    }, 5000);
  });
});