const models = require('../../models/index')
const uuid = require('uuid')
const v1 = uuid.v1
module.exports = {  dataset_create, distribution_create, keyword_create, dataset_keyword_create, datalake_create }

function test(){

    const data = {
        id: v1(),
        bucket: "us-ckan",
        type: "keyword",
        state: "active"
    }
    const result = models.Datalake.create(data).then(_ => console.log("data insert succeeded"))
    console.log(result)
}
// test()

function dataset_create(dataset){

    // dataset.id = v1()
    const result = models.Dataset.create(dataset).then(_ => console.log("dataset_create is succeeded"))
    return result
}

function distribution_create(distribution){

    // dataset.id = v1()
    const result = models.Distribution.create(distribution).then(_ => console.log("distribution_create is succeeded"))
    return result
}

function keyword_create(keyword){

    // dataset.id = v1()
    const result = models.Keyword.create(keyword).then(_ => console.log("keyword_create is succeeded"))
    return result
}

function dataset_keyword_create(dataset_keyword){

    // dataset.id = v1()
    const result = models.DatasetKeyword.create(dataset_keyword).then(_ => console.log("keyword_create is succeeded"))
    return result
}
function datalake_create(datalake){

    // dataset.id = v1()
    const result = models.Datalake.create(datalake).then(_ => console.log("keyword_create is succeeded"))
    return result
}

const dataset = {
    url: "test__",
    title: "test",
    issued: "2022-10-31 22:25:49.811+09",
    modified: "2022-10-31 22:25:49.811+09",
    identifier: "test",
    publisher: "test_publisher"
}
const distribution = {
    url: "test__",
    title: "test",
    issued: "2022-10-31 22:25:49.811+09",
    modified: "2022-10-31 22:25:49.811+09",
    identifier: "test",
    publisher: "test_publisher"
}
// console.log(dataset_create(dataset))