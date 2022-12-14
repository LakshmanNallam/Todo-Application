const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { search_q, priority, status } = request.query;
  if (priority !== undefined && status !== undefined) {
    const query = `select * from todo where priority like '${priority}' and status like '%${status}%';`;
    const data = await db.all(query);
    response.send(data);
  } else if (status !== undefined) {
    const query = `select * from todo where status like '%${status}%';`;
    const data = await db.all(query);
    response.send(data);
  } else if (priority !== undefined) {
    const query = `select * from todo where priority like '%${priority}%';`;
    const data = await db.all(query);
    response.send(data);
  } else if (search_q !== undefined) {
    const query = `select * from todo where todo like '%${search_q}%';`;
    const data = await db.all(query);
    response.send(data);
  }
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `select * from todo where id =${todoId};`;
  const data = await db.get(query);
  response.send(data);
});

app.post("/todos/", async (request, response) => {
  const contetn = request.body;
  const { id, todo, priority, status } = contetn;
  const query = `insert into todo (id,todo,priority,status) values (${id},'${todo}','${priority}','${status}');`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { status, priority, todo } = request.body;
  const { todoId } = request.params;
  if (status !== undefined) {
    const query = `update todo set status='${status}' where id=${todoId};`;
    await db.run(query);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const query = `update todo set priority='${priority}' where id=${todoId};`;
    await db.run(query);
    response.send("Priority Updated");
  } else if (todo !== undefined) {
    const query = `update todo set todo='${todo}' where id=${todoId};`;
    await db.run(query);
    response.send("Todo Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const wuery = `delete from todo where id =${todoId};`;
  await db.run(wuery);
  response.send("Todo Deleted");
});
module.exports = app;
