const KEYS = {
    BOOKS : 'library_book',
    MEMBER : 'library_member',
    TRANSACTION : 'library_transaction',
    SETTING : 'library_setting',
};
//from setting data to storage
function saveToStorage(key,data){
    try{
        localStorage.setItem(key,JSON.stringify(data));
        return true;
    }
    catch(err){
        console.log(`failed to store in storage[${key}]:`,err);
    }
}
//from getting data 
function loadFromStorage(key,fallbacks){
    try{
        const raw = localStorage.getItem(key);
        if(raw == null) return fallbacks;
        return JSON.parse(raw);
    }
    catch(err){
        console.log(`failed to load from storage [${key}]:`, err);
        return fallbacks;   
    }
}

export function getBooks(){
    return loadFromStorage(KEYS.BOOKS,[]);
}
export function getMember(){
    return loadFromStorage(KEYS.MEMBER,[]);
}
export function getTransaction(){
    return loadFromStorage(KEYS.TRANSACTION,[]);
}
export function getSetting(){
    return loadFromStorage(KEYS.SETTING,{theme : 'light'});
}

export function saveBooks(booksArray){
    return saveToStorage(KEYS.BOOKS,booksArray)
}
export function saveMember(memberArray){
    return saveToStorage(KEYS.MEMBER,memberArray)
}
export function saveTransaction(transactionArray){
    return saveToStorage(KEYS.TRANSACTION,transactionArray);
}
export function saveSetting(settingObj){
    return saveToStorage(KEYS.SETTING,settingObj);
}
