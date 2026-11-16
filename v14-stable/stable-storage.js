// Read existing results, but isolate all comparison-build writes.
(()=>{const native=window.localStorage;const prefix='echo404_stable_compare:';const proxy={getItem:k=>native.getItem(prefix+k)??native.getItem(k),setItem:(k,v)=>native.setItem(prefix+k,v),removeItem:k=>native.removeItem(prefix+k)};Object.defineProperty(window,'localStorage',{value:proxy});})();
