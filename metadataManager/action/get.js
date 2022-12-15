const models = require('../../models/index')
const uuid = require('uuid')
const v1 = uuid.v1
module.exports = { dataset_getAll, dataset_get, keyword_getAll, keyword_get, distribution_getAll, distribution_get, datalake_get }


function dataset_getAll() {

    const result = models.Dataset.findAll({ raw: true })
    return result
}


function dataset_get(dataset) {
    let _dataset = {
        attributes: ['id', 'name'],
        order: [['createdAt', 'DESC']],
        where: {
            id: dataset.id
        },
        raw: true
    }
    const result = models.Dataset.findOne({where: {url: dataset.url}})
    // return result
}

function keyword_get(keyword) {

    let _keyword = {
        attributes: ['id', 'name'],
        order: [['createdAt', 'DESC']],
        where: { name: keyword.name },
        raw: true
    }
    // const result = models.Keyword.findOne(_keyword)
    const result = models.Keyword.findOne({where: {name: keyword.name}})

    return result
}

function keyword_getAll() {


    const result = models.Keyword.findAll({ raw: true })
    return result
}

function distribution_getAll() {

    const result = models.Distribution.findAll({ raw: true }).then(_ => console.log("distribution_getAll is succeeded"))
    return result
}


function distribution_get(distribution) {
    let _distribution = {
        attributes: ['id', 'url', 'dataset_id', 'datalake_id', 'name'],
        order: [['createdAt', 'DESC']],
        where: { id: distribution.id }
    }
    const result = models.Distribution.findOne(_distribution, {raw: true})
    // console.log(result)
    return result
}

function datalake_get(datalake) {

    let _datalake = {
        attributes: ['id', 'bucket', 'state', 'type'],
        order: [['createdAt', 'DESC']],
        where: { bucket: datalake.bucket },
        raw: true
    }
    const result = models.Datalake.findOne({where: {bucket: datalake.bucket}})
    return result
}

// console.log(keyword_getAll())
// console.log(dataset_getAll())
// console.log(distribution_get({id: '17c616d0-597f-11ed-9994-25eda416914e' }))

// async function test() {
//     const dist = await distribution_get({ id: '17c616d0-597f-11ed-9994-25eda416914e' })
//     console.log(dist)
// }
// test()