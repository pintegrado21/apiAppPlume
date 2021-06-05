import { Request, Response, Router } from 'express'
import { Aires } from '../model/aire'
import { db } from '../database/database'

class AireRoutes {
    private _router: Router

    constructor() {
        this._router = Router()
    }
    get router(){
        return this._router
    }

    private getAires = async (req:Request, res: Response) => {
        await db.conectarBD()
        .then( async ()=> {
            const query = await Aires.find()
            res.json(query)
        })
        .catch((mensaje) => {
            res.send(mensaje)
        })
        await db.desconectarBD()
    }

    private getFecha = async (req:Request, res: Response) => {
        const { ano, mes, dia } = req.params
        console.log( ano, mes, dia )
        await db.conectarBD()
        .then( async ()=> {
            const query = await Aires.aggregate([
                {
                    $match:{}
                },
                {
                    $addFields: {
                        "fecha": {
                            $dateToParts: {date: "$date"}
                        }
                    }
                },
                {
                    $addFields: {
                        "ano": {$toString: "$fecha.year"},
                        "mes": {$toString: "$fecha.month"},
                        "dia": {$toString: "$fecha.day"},
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
                        "NO2": {$trunc: ["$NO2", 2]},
                        "pm10": {$trunc: ["$pm10", 2]},
                        "pm25": {$trunc: ["$pm25", 2]},
                        "latitude": 1,
                        "longitude": 1,
                        "timestamp": 1
                    }
                }
            ])
            res.json(query)
        })
        .catch((mensaje) => {
            res.send(mensaje)
        })
        await db.desconectarBD()
    }

    private getFecha2 = async (req:Request, res: Response) => {
        const { ano, mes, dia, cont } = req.params
        console.log( ano, mes, dia, cont )
        await db.conectarBD()
        .then( async ()=> {
            const query = await Aires.aggregate([
                {
                    $match:{}
                },
                {
                    $addFields: {
                        "fecha": {
                            $dateToParts: {date: "$date"}
                        },
                        "cont": cont
                    }
                },
                {
                    $addFields: {
                        "ano": {$toString: "$fecha.year"},
                        "mes": {$toString: "$fecha.month"},
                        "dia": {$toString: "$fecha.day"},
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
                                {case: { $regexMatch: { input: "$cont", regex: "no2"} }, then: ["$NO2"] },
                                {case: { $regexMatch: { input: "$cont", regex: "pm10"} }, then: ["$pm10"] },
                                {case: { $regexMatch: { input: "$cont", regex: "pm25"} }, then: ["$pm25"] },
                                {case: { $regexMatch: { input: "$cont", regex: "todo"} }, then: ["$NO2", "$pm10", "$pm25"] }
                            ]
                        }}
                    }
                }
            ])
            res.json(query)
        })
        .catch((mensaje) => {
            res.send(mensaje)
        })
        await db.desconectarBD()
    }

    private getFecha3 = async (req:Request, res: Response) => {
        const { time } = req.params
        console.log( time )
        await db.conectarBD()
        .then( async ()=> {
            const query = await Aires.aggregate([
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
            ])
            res.json(query)
        })
        .catch((mensaje) => {
            res.send(mensaje)
        })
        await db.desconectarBD()
    }

    misRutas(){
        this._router.get('/', this.getAires)
        this._router.get('/getFecha/:ano&:mes&:dia', this.getFecha)
        this._router.get('/getFecha2/:ano&:mes&:dia&:cont', this.getFecha2)
        this._router.get('/getFecha3/:time', this.getFecha3)
    }
}
const obj = new AireRoutes()
obj.misRutas()
export const aireRoutes = obj.router