export function generateId(prefix = 'id'){
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export function formatDate(isoString){
    if(!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US',{
        year : 'numeric',
        month : 'short',
        day : 'numeric'
    });
}

export function daysBetween(date1,date2){
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Math.abs(d2 - d1);
    return Math.floor(diff/msPerDay);
}

export function debounce(fn,delay = 300){
    let timeId;
    return function(...args){
        clearTimeout(timeId);
        timeId = setTimeout(() => fn.apply(this,args),delay);
    };
}

export function deepClone(obj){
    if(typeof structuredClone == 'function'){
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}