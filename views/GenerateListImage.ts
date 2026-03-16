import genList from './List'
import * as fs from "fs";
import db from '../database/data-source'

const penalties = db.penalty.list('test')

genList(penalties).then(async (buffer) => {
    fs.writeFileSync('Screenshot.png', buffer)
}).catch(console.error)
