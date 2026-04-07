function addToList(input, targetList) {
    const item = document.getElementById(input).value;

    const isEmpty = (str) => !/\S/.test(str);

    if (!item || isEmpty(item) ) {return console.error("Empty input forbidden.");}
    
    const li = document.createElement(`li`);
    li.textContent = item;

    document.getElementById(targetList).appendChild(li);

    console.log(`"${item}" appended to: ${targetList}`);
}