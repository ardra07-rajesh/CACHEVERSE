/* CACHEVERSE deterministic cache simulation engine */
(() => {
  const log2 = n => Math.log2(n);
  function validateConfig(c) {
    const errors=[];
    if(!Number.isInteger(c.cacheSize)||c.cacheSize<=0) errors.push("Cache size must be a positive integer.");
    if(!Number.isInteger(c.blockSize)||c.blockSize<=0||(c.blockSize&(c.blockSize-1))!==0) errors.push("Block size must be a positive power of two.");
    if(c.cacheSize%c.blockSize!==0) errors.push("Cache size must be divisible by block size.");
    const lines=c.cacheSize/c.blockSize;
    if(c.mapping==="fully") c.ways=lines;
    else if(c.mapping==="direct") c.ways=1;
    if(!Number.isInteger(c.ways)||c.ways<1||lines%c.ways!==0) errors.push("Associativity must divide the number of cache lines.");
    return {errors,lines,sets:lines/c.ways,offsetBits:log2(c.blockSize)};
  }
  function parseTrace(value) {
    const parts=String(value).trim().split(/[\s,;]+/).filter(Boolean);
    if(!parts.length) throw new Error("Enter at least one memory address.");
    const arr=parts.map(v=>Number(v));
    if(arr.some(v=>!Number.isSafeInteger(v)||v<0)) throw new Error("Addresses must be non-negative safe integers.");
    return arr;
  }
  function simulate(addresses,config) {
    const c={...config}; const check=validateConfig(c);
    if(check.errors.length) throw new Error(check.errors.join(" "));
    const {lines,sets}=check, cache=Array.from({length:sets},()=>[]);
    const rows=[]; let hits=0,misses=0,evictions=0,clock=0;
    for(let i=0;i<addresses.length;i++){
      const address=addresses[i],block=Math.floor(address/c.blockSize);
      const setIndex=c.mapping==="fully"?0:block%sets;
      const tag=c.mapping==="fully"?block:Math.floor(block/sets);
      const set=cache[setIndex]; clock++;
      let line=set.find(x=>x.block===block),hit=!!line,evicted=null;
      if(hit){hits++;line.last=clock;}
      else {
        misses++;
        if(set.length>=c.ways){
          let victim;
          if(c.policy==="FIFO") victim=set.reduce((a,b)=>a.inserted<=b.inserted?a:b);
          else if(c.policy==="RANDOM") victim=set[Math.floor(Math.random()*set.length)];
          else victim=set.reduce((a,b)=>a.last<=b.last?a:b);
          evicted=victim.block;set.splice(set.indexOf(victim),1);evictions++;
        }
        set.push({block,tag,inserted:clock,last:clock});
        line=set[set.length-1];
      }
      const lineIndex=setIndex*c.ways+set.indexOf(line);
      rows.push({step:i+1,address,block,set:setIndex,line:lineIndex,tag,offset:address%c.blockSize,hit,evicted,detail:hit?"Block found in cache.":evicted!==null?`Miss. Evicted block ${evicted} using ${c.policy}.`:"Miss. Empty cache way allocated."});
    }
    const total=addresses.length,ratio=total?hits/total:0;
    return {config:c,rows,hits,misses,evictions,total,ratio,missRatio:total?misses/total:0,amat:1+(misses/Math.max(1,total))*80,cache:cache.map(s=>s.map(x=>({...x}))),lines,sets};
  }
  function decode(address,c) {
    const check=validateConfig({...c});
    if(check.errors.length) throw new Error(check.errors.join(" "));
    const block=Math.floor(address/c.blockSize),offset=address%c.blockSize;
    const setIndex=c.mapping==="fully"?0:block%check.sets;
    const tag=c.mapping==="fully"?block:Math.floor(block/check.sets);
    const offsetBits=check.offsetBits,indexBits=c.mapping==="fully"?0:log2(check.sets);
    const tagBits=Math.max(0,32-offsetBits-indexBits);
    const binary=address.toString(2).padStart(32,"0").slice(-32);
    return {address,block,offset,set:setIndex,tag,offsetBits,indexBits,tagBits,binary,hex:"0x"+address.toString(16).toUpperCase(),line:setIndex*c.ways};
  }
  function comparePolicies(blocks,capacity=3) {
    return ["FIFO","LRU","RANDOM"].map(policy=>{
      const cache=[],rows=[];let hits=0,misses=0,age=0;
      blocks.forEach((block,i)=>{
        age++;let idx=cache.findIndex(x=>x.block===block),hit=idx>=0,evicted=null;
        if(hit){hits++;cache[idx].last=age;}
        else {misses++;if(cache.length>=capacity){let victim=policy==="FIFO"?cache.reduce((a,b)=>a.inserted<=b.inserted?a:b):policy==="LRU"?cache.reduce((a,b)=>a.last<=b.last?a:b):cache[Math.floor(Math.random()*cache.length)];evicted=victim.block;cache.splice(cache.indexOf(victim),1);}cache.push({block,inserted:age,last:age});}
        rows.push({step:i+1,block,hit,evicted,state:cache.map(x=>x.block)});
      });
      return {policy,hits,misses,ratio:blocks.length?hits/blocks.length:0,rows,final:cache.map(x=>x.block)};
    });
  }
  window.CacheEngine={validateConfig,parseTrace,simulate,decode,comparePolicies};
})();