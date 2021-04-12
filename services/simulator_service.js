const Config = require('../models/config');
const {v4} = require('uuid');
const { connection } = require('mongoose');

class SimulatorService
{
    _configs = {};
    _preCompiledFunctions = {
        $guid: () => v4()
    }

    constructor(configs)
    {
        configs.forEach(c => {
            this._configs[c.path] = c;
            this._compileFunctions(c);
        });
    }

    execute(request, response)
    {
        const config = this._get(request.path);
        if (!!config)
        {
            let json = this._replace(config, request);
            response.status(config.statusCode || 200);
            if (json) {
                response.json(json);
            } else {
                response.end();
            }
            return;
        }
        response.json(response.body);
    }

    getConfigs()
    {
        return {
            ...this._configs
        };
    }

    async save(config)
    {
        const register = await Config.findOneAndUpdate({
            path: config.path
        }, config, {upsert: true, useFindAndModify: false});
        this._configs[config.path] = register;
        this._compileFunctions(register);
        return register;
    }

    _get(path)
    {
        const config = this._configs[path];
        if (!!config) return config;

        for (const key in this) {
            const regex = new RegExp(key);
            if (regex.test(path))
            {
                return this[key];
            }
        }

        return null;
    }

    _compileFunctions(config)
    {
        if (!config.functions) return;
        
        for (const key in config.functions) {
            if (Object.hasOwnProperty.call(config.functions, key)) {
                const func = eval(config.functions[key]);
                preCompiledFunctions[key] = func;
            }
        }
    }

    _replace (config, request, obj = config.body) {
        if (obj == null) return obj;
    
        let value = obj;
        
        if (obj instanceof Array)
        {
            value = [];
            obj.forEach(element => {
                value.push(this._replace(config, request, element));
            });
        }
        else if (obj instanceof Object)
        {
            value = {};
            for (const key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    value[key] = this._replace(config, request, obj[key]);
                }
            }
        }
        else if (isNaN(obj)) {
            const func = this._preCompiledFunctions[obj];
            if (func != null)
            {
                value = func(request, config.scope);
            }
            else {
                value = obj;
            }
        }
        return value;
    }
};

module.exports = SimulatorService;