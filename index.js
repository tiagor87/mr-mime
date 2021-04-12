const express = require('express');
const mongoose = require('mongoose');
const Config = require('./models/config');
const SimulatorService = require('./services/simulator_service');

mongoose.connect(
    process.env.MRMIME_ConnectionStrings__MongoDb,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

const db = mongoose.connection;

let _simulatorService;

db.on("error", console.error.bind(console, "Connection error: "));
db.once("open", async () => {
  let configs = await Config.find({});
  _simulatorService = new SimulatorService(configs);
});

const app = express();
app.use(express.json());

app.post('/configs', async (request, response) => {
    const config = await _simulatorService.save(request.body);
    response.status(200).json(config);
});

app.get('/configs', (_, response) => {
    const configs = _simulatorService.getConfigs();
    response.status(200).json(configs);
});

app.use((request, response) => _simulatorService.execute(request, response));

app.listen(process.env.PORT || 3000);