import express from "express"
import cors from "cors"
import path from "path"
import { persons as initialPersons } from "./lib/data-placeholder"
import { generateId } from "./lib/utils"

import { unknownEndpoint } from "./middleware/unknown.middleware"

let persons = [...initialPersons]

const app = express()
const morgan = require("morgan")

app.use(cors())
app.use(express.json())
app.use(express.static("dist"))

morgan.token("body", (request: Request) => {
  return JSON.stringify(request.body)
})

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
)

type PersonProps = {
  name: string
  number: string
}

app.get("/", (request, response) => {
  response.sendFile(path.join(__dirname, "public", "dist/index.html"))
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.post("/api/persons", (request, response) => {
  const body: PersonProps = request.body

  if (!body.name || !body.number) {
    response.status(400).json({
      error: "Name or number missing",
    })
  }

  const personExist = persons.find((person) => person.name === body.name)

  personExist &&
    response.status(400).json({
      error: "Name must be unique",
    })

  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})

app.get("/info", (request, response) => {
  response.send(
    `<h2>Phonebook has info for ${persons.length} people</h2>
    <h2>${new Date()}</h2>
    `
  )
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find((person) => person.id === id)

  !person ? response.status(404).end() : response.json(person)
})

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
