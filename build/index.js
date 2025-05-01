"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const data_placeholder_1 = require("./lib/data-placeholder");
const utils_1 = require("./lib/utils");
const unknown_middleware_1 = require("./middleware/unknown.middleware");
let persons = [...data_placeholder_1.persons];
const app = (0, express_1.default)();
const morgan = require("morgan");
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.resolve(__dirname, "..", "public")));
morgan.token("body", (request) => {
    return JSON.stringify(request.body);
});
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));
console.log(__dirname);
app.get("/", (request, response) => {
    response.sendFile(path_1.default.resolve(__dirname, "..", "public", "index.html"));
});
app.get("/api/persons", (request, response) => {
    response.json(persons);
});
app.post("/api/persons", (request, response) => {
    const body = request.body;
    if (!body.name || !body.number) {
        response.status(400).json({
            error: "Name or number missing",
        });
    }
    const personExist = persons.find((person) => person.name === body.name);
    personExist &&
        response.status(400).json({
            error: "Name must be unique",
        });
    const newPerson = {
        id: (0, utils_1.generateId)(),
        name: body.name,
        number: body.number,
    };
    persons = persons.concat(newPerson);
    response.json(newPerson);
});
app.get("/info", (request, response) => {
    response.send(`<h2>Phonebook has info for ${persons.length} people</h2>
    <h2>${new Date()}</h2>
    `);
});
app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const person = persons.find((person) => person.id === id);
    !person ? response.status(404).end() : response.json(person);
});
app.delete("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    persons = persons.filter((person) => person.id !== id);
    response.status(204).end();
});
app.use(unknown_middleware_1.unknownEndpoint);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
