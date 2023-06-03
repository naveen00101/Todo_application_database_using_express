const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite = require("sqlite3");

const dbPath = path.join(__dirname, "./todoApplication.db");
let db = null;

const app = express();
app.use(express.json());

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running At 3000");
    });
  } catch (error) {
    console.log(`DB ERROR is ${error.message}`);
    process.exit(1);
  }
};

initializeServerAndDB();

app.get("/todos/", async (request, response) => {
  let data = null;
  let query = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      query = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }
  console.log(query);
  result = await db.all(query);

  response.send(result);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT * FROM todo WHERE id = ${todoId};`;
  const result = await db.get(query);
  response.send(result);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  console.log(request.body);
  const query = `INSERT INTO todo(id , todo, priority, status) 
                            VALUES (${id}, '${todo}', '${priority}', '${status}');`;
  const result = await db.run(query);
  console.log(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo } = request.body;
  let query = ``;
  let responseText = "";
  switch (true) {
    case status !== undefined:
      query = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      responseText = "Status Updated";
      break;
    case priority !== undefined:
      query = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      responseText = "Priority Updated";
      break;
    case todo !== undefined:
      query = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      responseText = "Todo Updated";
      break;
    default:
      break;
  }

  const result = await db.run(query);
  response.send(responseText);
});

app.delete("/todos/:todoId", async (request, respond) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo WHERE id = ${todoId};`;
  const result = await db.run(query);
  respond.send("Todo Deleted");
});

module.exports = app;
