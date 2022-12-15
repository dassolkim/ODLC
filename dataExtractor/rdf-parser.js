const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser')
const uuid = require('uuid')
const mime = require('mime-types')
module.exports = {
    catalogParser, distributionParser, keywordParser, keywordDistributionParser,
    datasetParser, schemaParser, socrataDatasetParser, odsDatasetParser, keywordDatasetParser, keywordDistToDatabaseParser,
    socrataKeywordDatasetParser, socrataKeywordToDatabaseParser, arcgisKeywordToDatabaseParser, odsKeywordDatasetParser, odsKeywordToDatabaseParser
}

function catalogParser(data) {
    const options = {
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    }
    const catalogParser = new XMLParser(options);
    const catalog = catalogParser.parse(data);

    return catalog
}

function distributionParser(catalog, format) {

    const data = catalog
    const dist = data['rdf:RDF']['dcat:Distribution'] // US & UK catalog, DKAN (Oklahoma)
    // const dist = data['rdf:RDF']['rdf:Description']  // CA catalog

    if (dist) {
        const count = Object.keys(dist).length;
        console.log(`Number of Distribution in Catalog: ${count}`)
        let i = 0
        let j = 0
        let url_list = []
        while (i < count) {
            const exist = dist[i]
            if (exist != undefined) {
                if (dist[i]['dct:format'] == format) {
                    if (dist[i]['dcat:accessURL']) {
                        url_list[j] = dist[i]['dcat:accessURL']['@_rdf:resource']
                        j++
                    }
                }
                i++
            } else { i++ }

        }
        return url_list
    } else { return false }
}

function keywordDatasetParser(dataset, keywords) {

    const count = dataset.length
    let i = 0
    const results = []
    while (i < count) {
        const exist = dataset[i]
        if (exist != undefined) {
            let tag = dataset[i]['dcat:Dataset']['dcat:keyword']
            let j = 0
            while (j < keywords.length) {
                if (tag.indexOf(keywords[j]) != -1) {
                    let temp = {
                        dataset: {
                            id: "string",
                            url: dataset[i]['dcat:Dataset']['@_rdf:about'],
                            title: dataset[i]['dcat:Dataset']['dct:title'],
                            issued: dataset[i]['dcat:Dataset']['dct:issued']['#text'],
                            modified: dataset[i]['dcat:Dataset']['dct:modified']['#text'],
                            identifier: dataset[i]['dcat:Dataset']['dct:identifier']['@_rdf:resource'],
                            keyword: keywords[j]
                        },
                        distribution: dataset[i]['dcat:Dataset']['dcat:distribution']
                    }
                    results.push(temp)
                }
                j++
            }
        }
        i++
    }
    return results
}

function keywordParser(dataset, keywords) {

    const count = dataset.length
    let i = 0
    const results = []
    while (i < count) {
        const exist = dataset[i]
        if (exist != undefined) {
            let tag = dataset[i]['dcat:Dataset']['dcat:keyword']
            let j = 0
            while (j < keywords.length) {
                if (tag.indexOf(keywords[j]) != -1) {
                    let temp = {
                        dataset: dataset[i]['dcat:Dataset']['@_rdf:about'],
                        distribution: dataset[i]['dcat:Dataset']['dcat:distribution']
                    }
                    results.push(temp)
                }
                j++
            }
        }
        i++
    }
    return results
}

function keywordDistributionParser(catalog, resoucreUrls) {

    const data = catalog
    // const dist = data['rdf:RDF']['dcat:Distribution'] // US & UK catalog, DKAN (Oklahoma)
    const dist = data['rdf:RDF']['rdf:Description']  // CA catalog, Opendatasoft
    const rcount = resoucreUrls.length
    if (dist) {
        const count = Object.keys(dist).length;
        console.log(`Number of Distribution in Catalog: ${count}`)
        let i = 0
        let j = 0
        let url_list = []
        while (i < count) {
            const exist = dist[i]
            if (exist != undefined) {
                if (dist[i]['dcat:accessURL']) {
                    if (resoucreUrls.indexOf(dist[i]['@_rdf:about']) != -1) {
                        let temp = {
                            url: dist[i]['dcat:accessURL']['@_rdf:resource'],
                            format: dist[i]['dct:format'],
                            mediatype: dist[i]['dcat:mediaType'],
                            identifier: dist[i]['@_rdf:about']
                        }
                        url_list.push(temp)
                    }
                    i++
                }
            } else { i++ }
        }
        return url_list
    } else { return false }
}

function keywordDistToDatabaseParser(catalog, resoucreUrls) {

    const data = catalog
    // const dist = data['rdf:RDF']['dcat:Distribution'] // US & UK catalog, DKAN (Oklahoma)
    const dist = data['rdf:RDF']['rdf:Description']  // CA catalog
    const rcount = resoucreUrls.length
    console.log(rcount)
    if (dist) {
        const count = Object.keys(dist).length;
        console.log(`Number of Distribution in Catalog: ${count}`)
        let i = 0
        let j = 0
        let url_list = []

        while (i < count) {
            const exist = dist[i]
            if (exist != undefined) {
                if (dist[i]['dcat:accessURL']) {
                    for (let k = 0; k < rcount; k++) {
                        if (resoucreUrls[k][0]['@_rdf:resource'] == dist[i]['@_rdf:about']) {
                            let temp = {
                                url: dist[i]['dcat:accessURL']['@_rdf:resource'],
                                format: dist[i]['dct:format'],
                                mediatype: dist[i]['dcat:mediaType'],
                                identifier: dist[i]['@_rdf:about'],
                                dataset_id: resoucreUrls[k][1],
                                title: resoucreUrls[k][2]
                            }
                            url_list.push(temp)
                        }
                    }
                    i++
                }
            } else { i++ }

        }
        return url_list
    } else { return false }
}

function datasetParser(catalog) {

    const dataset = catalog['rdf:RDF']['dcat:Catalog']['dcat:dataset'] // US & UK catalog, DKAN (Oklahoma)

    const count = dataset.length
    console.log(`Number of Datasets in Catalog: ${count}`)

    return dataset
}


function schemaParser(catalog) {
    const schema = catalog['rdf:RDF']['hydra:PagedCollection']

    const fp = schema['hydra:firstPage']
    const lp = schema['hydra:lastPage']
    const np = schema['hydra:nextPage']
    const ti = schema['hydra:totalItems']['#text']

    const results = {
        firstPage: fp,
        lastPage: lp,
        nextPage: np,
        totalItem: ti
    }

    return results
}

function socrataDatasetParser(catalog) {

    const dataset = catalog.dataset
    const dataset_count = dataset.length
    // console.log(dataset_count)
    let dist_list = []

    for (let nd = 0; nd < dataset_count; nd++) {
        dist_list[nd] = dataset[nd]['distribution']
    }

    return dist_list
}

function socrataKeywordDatasetParser(catalog, keywords) {

    // const dataset = catalog.dataset
    const dataset = catalog.dataset
    const count = dataset.length
    const kcount = keywords.length
    const results = []
    for (let i = 0; i < count; i++) {
        let exist = dataset[i]
        if (exist != undefined) {
            let tag = []
            tag = dataset[i]['keyword']

            for (let j = 0; j < kcount; j++) {
                if (tag != undefined) {
                    if (tag.indexOf(keywords[j]) != -1) {
                        let temp = {
                            dataset: {
                                id: "string",
                                url: dataset[i]['landingPage'],
                                title: dataset[i]['title'],
                                issued: dataset[i]['issued'],
                                modified: dataset[i]['modified'],
                                identifier: dataset[i]['identifier'],
                                keyword: keywords[j]
                            },
                            distribution: dataset[i]['distribution']
                        }
                        results.push(temp)
                        if (i == 1) console.log(`print in rdf-parser: ${temp}`)
                    }
                }
            }
        }
    }
    return results
}

function socrataKeywordToDatabaseParser(filteredData) {


    const fcount = filteredData.length
    const url_list = []

    for (let i = 0; i < fcount; i++) {
        let rdist = filteredData[i]
        if (rdist != undefined) {
            let temp = {
                url: rdist[0]['downloadURL'],
                format: mime.extension(rdist[0]['mediaType']),
                mediatype: rdist[0]['mediaType'],
                identifier: rdist[3],
                dataset_id: rdist[1],
                title: rdist[2]
            }
            url_list.push(temp)
        }
    }
    return url_list
}

function arcgisKeywordToDatabaseParser(filteredData) {

    const fcount = filteredData.length
    const url_list = []

    for (let i = 0; i < fcount; i++) {
        let rdist = filteredData[i]
        if (rdist != undefined) {
            let temp = {
                url: rdist[0]['accessURL'],
                format: mime.extension(rdist[0]['mediaType']),
                mediatype: rdist[0]['mediaType'],
                identifier: rdist[3],
                dataset_id: rdist[1],
                title: rdist[2]
            }
            url_list.push(temp)
        }
    }
    return url_list
}

function odsKeywordToDatabaseParser(filteredData) {

    const fcount = filteredData.length
    const url_list = []

    for (let i = 0; i < fcount; i++) {
        let rdist = filteredData[i]
        if (rdist != undefined) {
            let temp = {
                url: rdist[0]['accessURL'],
                format: rdist[0]['format'],
                mediatype: rdist[0]['mediaType'],
                identifier: rdist[3],
                dataset_id: rdist[1],
                title: rdist[2]
            }
            console.log()
            url_list.push(temp)
        }
    }
    return url_list
}

function odsKeywordDatasetParser(dataset, keywords) {

    const count = dataset.length
    const kcount = keywords.length
    const results = []
    for (let i = 0; i < count; i++) {
        let exist = dataset[i]
        let tag = dataset[i]['keyword']
        if (tag != undefined) {
            const tag_lower = tag.map(element => {
                return element.toLowerCase()
            })

            for (let j = 0; j < kcount; j++) {
                if (tag != undefined) {
                    if (tag_lower.indexOf(keywords[j]) != -1) {
                        let temp = {
                            dataset: {
                                id: "string",
                                url: dataset[i]['landingPage'],
                                title: dataset[i]['title'],
                                issued: dataset[i]['modified'],
                                modified: dataset[i]['modified'],
                                identifier: dataset[i]['identifier'],
                                keyword: keywords[j]
                            },
                            distribution: dataset[i]['distribution']
                        }
                        results.push(temp)
                    }
                }
            }
        }
    }
    return results
}

function odsDatasetParser(catalog, format) {
    const data = catalog
    const dist = data['rdf:RDF']['rdf:Description']
    console.log(dist)
    if (dist) {
        const count = Object.keys(dist).length;
        console.log(`Number of Distribution in Catalog: ${count}`)
        let i = 0
        let j = 0
        let url_list = []
        while (i < count) {
            const exist = dist[i]
            if (exist != undefined) {
                if (dist[i]['dct:format'] == format) {
                    if (dist[i]['dcat:accessURL']) {
                        url_list[j] = dist[i]['dcat:accessURL']['@_rdf:resource']
                        j++
                    }
                }
                i++
            } else { i++ }
        }
        return url_list
    } else { return false }
}