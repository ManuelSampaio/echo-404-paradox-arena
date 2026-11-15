(() => {
 if(!('serviceWorker' in navigator)||!window.isSecureContext)return;
 window.addEventListener('load',()=>{navigator.serviceWorker.register('./paradox-sw.js',{updateViaCache:'none'}).then(async registration=>{await registration.update().catch(()=>{});return registration;}).then(()=>navigator.serviceWorker.ready).then(()=>{const text=document.getElementById('offline14');if(text)text.textContent='Preparado para jogar offline neste navegador. As gravações continuam neste dispositivo.';}).catch(()=>{});});
})();
