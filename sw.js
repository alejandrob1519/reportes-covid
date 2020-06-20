// importando sw-utils.js
importScripts ('js/sw-utils.js');

//Lo 1ro que haremos en el SW, es crear las constantes
const STATIC_CACHE    = 'static-v1';
const DYNAMIC_CACHE   = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

//lo 2do es crear nuestra APPSHELL
//asegurarse que esten bien escritas, porque si una falla no se podrá instalar el appshell
const APP_SHELL = [
    'index.html',
    'css/style.css',
    'js/sw-utils.js',
    'img/favicon.ico'
];

const APP_SHEL_INMUTABLE = [
	'https://cdn.datatables.net/plug-ins/1.10.11/i18n/Spanish.json',
	'https://mathjax.rstudio.com/latest/MathJax.js'
   /* 'https://mathjax.rstudio.com/latest/MathJax.js',
    'https://mathjax.rstudio.com/2.7.2/jax/output/HTML-CSS/jax.js?V=2.7.2',
    'https://mathjax.rstudio.com/2.7.2/jax/output/HTML-CSS/fonts/TeX/fontdata.js?V=2.7.2',
    'https://mathjax.rstudio.com/2.7.2/config/TeX-AMS-MML_HTMLorMML.js?V=2.7.2',
	'https://mathjax.rstudio.com/2.7.2/MathJax.js?config=TeX-AMS-MML_HTMLorMML',    
    'https://mathjax.rstudio.com/2.7.2/fonts/HTML-CSS/TeX/woff/MathJax_Main-Regular.woff?V=2.7.2',
    'https://mathjax.rstudio.com/2.7.2/fonts/HTML-CSS/TeX/woff/MathJax_Size1-Regular.woff?V=2.7.2',
    'https://mathjax.rstudio.com/2.7.2/fonts/HTML-CSS/TeX/woff/MathJax_Math-Italic.woff?V=2.7.2'*/
];

//3ro procederemso a instalar nuestroas appshels
self.addEventListener('install', e => {

    const cacheStaticPromesa = caches.open(STATIC_CACHE)
                              .then(cacheResp => cacheResp.addAll(APP_SHELL));

    const cacheInmutablePromesa = caches.open(INMUTABLE_CACHE)
                              .then(cacheResp => cacheResp.addAll(APP_SHEL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStaticPromesa, cacheInmutablePromesa]));  
});

//4to ahora haremos un proceso para borrar las caches antiguas
self.addEventListener('activate', e => {

    //verificamos si la version del cache actual es la misma que el anterior, de ser diferente se tiene que borrar el cache estatico.
    const respuesta = caches.keys().then(llavesCache => {

        llavesCache.forEach(llave => {

            //Borrando versiones anteriores de cache static
            if(llave !== STATIC_CACHE && llave.includes('static')){
                return caches.delete(llave);
            }

            //Borrando versiones anteriores de cache dynamic
            if(llave !== DYNAMIC_CACHE && llave.includes('dynamic')){
                return caches.delete(llave);
            }

        });
    });

    e.waitUntil(respuesta);
});

//5to implementando estrategia cache con network fallback
self.addEventListener('fetch', e => {

    const respuesta =  caches.match(e.request).then(respCache => {
        
        if(respCache){
            return respCache;
        }else{
            //con este console, atraparé las peticiones secundarias que hace por ejemplo google fonts, las cuales no estan registradas en mi APP_SHEL_INMUTABLE
            //console.log(e.request.url);

            //ahora implementaremos parte de la estrategia del "dynamic cache" es decir del "network fallback".
            //ahora necesito hacer un fetch al recurso nuevo para almacenarlo en el cache dinamico
            return fetch(e.request).then( newResp => {

                //Actualizando el cache dinamico, para ello le paso los argumentos a la funcion que cree en 'js/sw-utils.js'
                return actualizarCacheDinamico(DYNAMIC_CACHE, e.request, newResp);
            });
        }
    });

    e.respondWith(respuesta);
});
