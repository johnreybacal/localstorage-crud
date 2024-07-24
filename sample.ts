import { Model, Schema } from "./src";
import ModelSettings from "./src/modelSettings";

interface Person extends Schema {
    name: string;
    age: number;
    hobbies: string[];
}
const modelSettings: ModelSettings = {
    timestamps: false,
    softDelete: true,
};
const personModel = new Model<Person>("person", modelSettings);
personModel.truncate();

const person = personModel.build();

person.name = "johnrey";
person.age = 1;

person.save();

const person2 = personModel.create({
    name: "john doe",
    age: 2,
    hobbies: [],
});
const person3 = personModel.build({
    name: "jane doe",
    age: 3,
    hobbies: ["acting"],
});

person2.name = "ghege";

person2.save();

person3.save();

personModel.create([
    {
        name: "1",
        age: 1,
        hobbies: [],
    },
    {
        name: "2",
        age: 1,
        hobbies: [],
    },
    {
        name: "3",
        age: 1,
        hobbies: [],
    },
]);

const persons = personModel.build([
    {
        name: "4",
        age: 4,
        hobbies: [],
    },
    {
        name: "5",
        age: 5,
        hobbies: [],
    },
    {
        name: "6",
        age: 6,
        hobbies: [],
    },
]);

persons[0].save();
persons[1].name = "Not 5";
persons[1].save();
persons[0].delete();

persons.save();

const personss = personModel.list();

personss[1].name = "PERSON 1";

personss.save();

const personWithAge1 = personModel.find({
    age: 1,
});

personWithAge1.delete();

const janeDoe = personModel.findOne({ name: "jane doe" });

if (janeDoe) {
    console.log(janeDoe);
    janeDoe.age = 33;
    janeDoe.save();
    console.log(personModel.findById(janeDoe.id));
}