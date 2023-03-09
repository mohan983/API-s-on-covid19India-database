const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");

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

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    districtId: dbObject.district_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
    districtName: dbObject.district_name,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//API_1

app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
      *
    FROM
      state
    ;`;
  const stateArray = await db.all(getStatesQuery);
  response.send(
    stateArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API_3

app.post("/districts/", async (request, response) => {
  const districtsDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtsDetails;
  const addDistrictDetails = `
    INSERT INTO
      district(district_name,state_id,cases,cured,active,deaths)
    VALUES
      (
        '${directorName}',
        '${stateId}',
        '${cases}',
        '${cured}',
        '${active}',
        '${deaths}',
      );`;

  const dbResponse = await db.run(addDistrictDetails);
  const districtId = dbResponse.lastID;
  response.send("District Successfully Added");
});

//API_2

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getStateDetails = `
    SELECT
      *
    FROM
      state
    WHERE
      state_id = '${stateId}';`;
  const state = await db.get(getStateDetails);
  response.send(
    state.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API_4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetails = `
    SELECT
      *
    FROM
      district
    WHERE
      district_id = '${districtId}';`;
  const district = await db.get(getDistrictDetails);
  response.send(
    district.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API_6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictDetails = `
    UPDATE
      district
    SET
      district_name='${districtName}',
      state_id='${stateId}',
      cases='${cases}',
      cured='${cured}',
      active='${active}',
      deaths='${deaths}'
    WHERE
      district_id='${districtId}';
      `;

  const dbResponse = await db.run(updateDistrictDetails);

  response.send("District Details Updated");
});

//API_5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictDetails = `
    DELETE FROM
      district
    
    WHERE
      district_id='${districtId}';
      `;

  const dbResponse = await db.run(deleteDistrictDetails);

  response.send("District Removed");
});

//API-7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateStatsQuery = `
SELECT
SUM(cases),
SUM(cured),
SUM(active),
SUM(deaths)
FROM
district
WHERE
state_id='${stateId}';`;
  const stats = await database.get(getStateStatsQuery);
  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API_8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictIdQuery = `
select state_id from district
where district_id = '${districtId}';
`; //With this we will get the state_id using district table
  const getDistrictIdQueryResponse = await database.get(getDistrictIdQuery);

  const getStateNameQuery = `
select state_name as stateName from state
where state_id = '${getDistrictIdQueryResponse.state_id}';
`; //With this we will get state_name as stateName using the state_id
  const getStateNameQueryResponse = await database.get(getStateNameQuery);
  response.send(getStateNameQueryResponse);
});

module.exports = app;
