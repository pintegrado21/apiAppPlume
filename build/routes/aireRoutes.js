"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aireRoutes = void 0;
const express_1 = require("express");
const aire_1 = require("../model/aire");
const database_1 = require("../database/database");
class AireRoutes {
    constructor() {
        this.getAires = (req, res) => __awaiter(this, void 0, void 0, function* () {
            yield database_1.db.conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const query = yield aire_1.Aires.find();
                res.json(query);
            }))
                .catch((mensaje) => {
                res.send(mensaje);
            });
            yield database_1.db.desconectarBD();
        });
        this.getFecha = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { ano, mes, dia } = req.params;
            console.log(ano, mes, dia);
            yield database_1.db.conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const query = yield aire_1.Aires.aggregate([
                    {
                        $match: {}
                    },
                    {
                        $addFields: {
                            "fecha": {
                                $dateToParts: { date: "$date" }
                            }
                        }
                    },
                    {
                        $addFields: {
                            "ano": { $toString: "$fecha.year" },
                            "mes": { $toString: "$fecha.month" },
                            "dia": { $toString: "$fecha.day" },
                        }
                    },
                    {
                        $match: {
                            "ano": ano,
                            "mes": mes,
                            "dia": dia
                        }
                    },
                    {
                        $project: {
                            "date": 1,
                            "NO2": { $trunc: ["$NO2", 2] },
                            "pm10": { $trunc: ["$pm10", 2] },
                            "pm25": { $trunc: ["$pm25", 2] },
                            "latitude": 1,
                            "longitude": 1,
                            "timestamp": 1
                        }
                    }
                ]);
                res.json(query);
            }))
                .catch((mensaje) => {
                res.send(mensaje);
            });
            yield database_1.db.desconectarBD();
        });
        this.getFecha2 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { ano, mes, dia, cont } = req.params;
            console.log(ano, mes, dia, cont);
            yield database_1.db.conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const query = yield aire_1.Aires.aggregate([
                    {
                        $match: {}
                    },
                    {
                        $addFields: {
                            "fecha": {
                                $dateToParts: { date: "$date" }
                            },
                            "cont": cont
                        }
                    },
                    {
                        $addFields: {
                            "ano": { $toString: "$fecha.year" },
                            "mes": { $toString: "$fecha.month" },
                            "dia": { $toString: "$fecha.day" },
                        }
                    },
                    {
                        $match: {
                            "ano": ano,
                            "mes": mes,
                            "dia": dia
                        }
                    },
                    {
                        $project: {
                            "ano": 1,
                            "mes": 1,
                            "dia": 1,
                            "latitude": 1,
                            "longitude": 1,
                            "cont": 1,
                            "dato": { $switch: {
                                    branches: [
                                        { case: { $regexMatch: { input: "$cont", regex: "no2" } }, then: ["$NO2"] },
                                        { case: { $regexMatch: { input: "$cont", regex: "pm10" } }, then: ["$pm10"] },
                                        { case: { $regexMatch: { input: "$cont", regex: "pm25" } }, then: ["$pm25"] },
                                        { case: { $regexMatch: { input: "$cont", regex: "todo" } }, then: ["$NO2", "$pm10", "$pm25"] }
                                    ]
                                } }
                        }
                    }
                ]);
                res.json(query);
            }))
                .catch((mensaje) => {
                res.send(mensaje);
            });
            yield database_1.db.desconectarBD();
        });
        this.getFecha3 = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { time } = req.params;
            console.log(time);
            yield database_1.db.conectarBD()
                .then(() => __awaiter(this, void 0, void 0, function* () {
                const query = yield aire_1.Aires.aggregate([
                    {
                        $match: {
                            "timestamp": time
                        }
                    },
                    {
                        $project: {
                            "dato": ["$NO2", "$pm10", "$pm25"],
                            "latitude": 1,
                            "longitude": 1
                        }
                    }
                ]);
                res.json(query);
            }))
                .catch((mensaje) => {
                res.send(mensaje);
            });
            yield database_1.db.desconectarBD();
        });
        this._router = express_1.Router();
    }
    get router() {
        return this._router;
    }
    misRutas() {
        this._router.get('/', this.getAires);
        this._router.get('/getFecha/:ano&:mes&:dia', this.getFecha);
        this._router.get('/getFecha2/:ano&:mes&:dia&:cont', this.getFecha2);
        this._router.get('/getFecha3/:time', this.getFecha3);
    }
}
const obj = new AireRoutes();
obj.misRutas();
exports.aireRoutes = obj.router;
