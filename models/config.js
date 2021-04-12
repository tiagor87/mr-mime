const { Schema, model } = require('mongoose');

const ConfigSchema = new Schema({
    path: {
        type: String,
        required: [true, 'Config path is required']
    },
    scope: {
        type: Object
    },
    functions: {
        type: Array
    },
    body: {
        type: Object
    },
    statusCode: {
        type: Number
    }
});

const Config = model("Configs", ConfigSchema);

module.exports = Config;