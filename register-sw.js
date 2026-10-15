/* Enregistrement prudent du Service Worker CamerLink. */
(function(){
'use strict';
if(!('serviceWorker' in navigator))return;
window.addEventListener('load',function(){
  navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(err){
    console.warn('[CamerLink] Service Worker indisponible',err&&err.message);
  });
});
})();