const user = {
    name: "Abhay",
    age: 22
};

const { name, age, city = "Junagadh" } = user;

console.log(name);
console.log(age);
console.log(city);