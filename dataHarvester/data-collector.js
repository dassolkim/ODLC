const axios = require('axios').default

module.exports = { getCatalog, getNextCatalog, getDataset, getSocrata, getOpenDataSoft, getDKANJson, getRealData, getRealDataToFile }

function getCatalog(sourceInfo) {
  
    const url = sourceInfo.defaultUrl + "catalog.rdf"

    const result = axios.post(url)
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

function getDataset(sourceInfo) {

    const url = sourceInfo.defaultUrl + ".rdf"
   
    const result = axios.post(url)
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

function getNextCatalog(sourceInfo, page) {
    
    const url = sourceInfo.defaultUrl + "catalog.rdf?page=" + page
    

    const result = axios.get(url) // when 405 error occurs, change post to get
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

function getSocrata(sourceInfo) {
  
    const url = sourceInfo.defaultUrl + "data.json"

    const result = axios.get(url)
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

function getDKANJson(sourceInfo) {
  
    const url = sourceInfo.defaultUrl + "data.json"

    const result = axios.get(url)
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

function getOpenDataSoft(sourceInfo) {
  
    const url = sourceInfo.defaultUrl + "/api/v2/catalog/exports/rdf"

    const result = axios.get(url)
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

async function getRealData(url, contentType) {

    const result = axios.get(url, {headers: {'Content-Type': contentType}})
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}

async function getRealDataToFile(url) {

    const result = axios.get(url, {responseType: 'arraybuffer'})
        .then(function (response) {
            const data = response.data
            return data

        }).catch(function (error) {
            console.log(error)
        })
    return result
}