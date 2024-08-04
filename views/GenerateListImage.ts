import genList from './List'
import * as fs from "fs";
import getDatabase from '../database/data-source'
import {Penalty} from "../database/entity/Penalty";

(async () => {
    const database = await getDatabase()

    const penalties = await database
        .getRepository(Penalty)
        .createQueryBuilder('penalty')
        .select('penalty.name', 'name')
        .addSelect('penalty.description', 'description')
        .addSelect('penalty.price', 'price')
        .getRawMany()

    await genList(penalties).then(async (buffer) => {
        fs.writeFileSync('Screenshot.png', buffer)
    }).catch(console.error)
})()




