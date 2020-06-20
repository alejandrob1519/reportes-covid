function actualizarCacheDinamico(dynamicCache, req, res){
    if(res.ok){
        return caches.open(dynamicCache).then(cacheResp => {            
            cacheResp.put(req, res.clone());
            return req.clone();
        });
    }else{
        return res;
    }

}