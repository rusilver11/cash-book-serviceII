const randNumber = function(counter){
    const save = [];
    for(let i = 0; i < counter; i++){
    let number = Math.floor(Math.random() * 10);
    save.push(number);
    }
    let trans = save.join("");
    return trans;
    }

export default randNumber; 