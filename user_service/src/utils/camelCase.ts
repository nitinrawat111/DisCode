// Converts string from snake case to camel case.
// Doesn't preserve underscore at beginning (_user_id will become userId) 
export const strToCamelCase = function (str: string) {
    const words = str.split("_");
    
    let firstWordIdx = 0;
    while(words[firstWordIdx] === '')
        firstWordIdx++;

    for (let i = firstWordIdx + 1; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join('');
}

// Converts object keys from snake case to camel case
export const objKeysToCamelCase = function(obj: any) {
    const newObj: any = {};
    for(const key in obj) {
        // If current field has an object as value, call the same function for that object
        if(obj[key]?.constructor === Object) {
            obj[key] = objKeysToCamelCase(obj[key]);
        }

        // Assign the value to new camel case key
        newObj[strToCamelCase(key)] = obj[key];
    }
    return newObj;
}