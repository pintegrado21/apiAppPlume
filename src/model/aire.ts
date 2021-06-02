import { Schema, model } from 'mongoose'

const aireSchema = new Schema({
    "timestamp": {type: String, unique:true},
    "date": {type: String},
    "NO2": {type: Number},
    "VOC": {type: Number},
    "pm10": {type: Number},
    "pm25": {type: Number},
    "NO2_AQI": {type: Number},
    "VOC_AQI": {type: Number},
    "pm10_AQI": {type: Number},
    "pm25_AQI": {type: Number},
    "pm1": {type: Number},
    "pm1_AQI": {type: Number},
    "latitude": {type: String},
    "longitude": {type: String}
},{
    collection: 'plume'
})

export const Aires = model('aire', aireSchema)