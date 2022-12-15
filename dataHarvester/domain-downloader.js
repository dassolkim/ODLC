// const config = require('../../config/openDataConfig')
const dc = require('./data-collector')
const fh = require('../fileHandler/file-handler')
const rp = require('../dataExtractor/rdf-parser')
const path = require('path')
const defaultPath = path.join('C:/Users/kimds/nodeProject', 'data/')
const create = require('../metadataManager/action/create')
const get = require('../metadataManager/action/get')
const uuid = require('uuid')
const mime = require('mime-types')

module.exports = {
    downloadDomainUrls, downloadFormatUrls, downloadSocrataDataset, downloadODSDataset,
    downloadArcGISDataset, downloadAllCatalog, ckanKeywordBasedLogic, socrataKeywordBasedLogic,
    dkanKeywordBasedLogic, arcgisKeywordBasedLogic, odsKeywordBasedLogic
}
const v1 = uuid.v1
async function checkPushlisher(sourceInfo) {
    if (portal = 'US') publisher = 'CKAN'
    if (portal = 'CA') publisher = 'CKAN'
    if (portal = 'UK') publisher = 'CKAN'
    if (portal = 'IE') publisher = 'CKAN'
    if (portal = 'SG') publisher = 'CKAN'
    if (portal = 'CH') publisher = 'CKAN'
    if (portal = 'OK') publisher = 'DKAN_rdf'
    if (portal = 'HHS') publisher = 'DKAN_json'
    if (portal = 'NY') publisher = 'Socrata'
    if (portal = 'SF') publisher = 'Socrata'
    if (portal = 'LC') publisher = 'Opendatasoft'
    if (portal = 'BS') publisher = 'Opendatasoft'

}

async function ckanKeywordBasedLogic(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    let key_string = ""
    // console.log(keywords)
    // console.log(keywords.length)
    let keyword_list = []
    let getAll = await get.keyword_getAll()

    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) {
            let string = keywords[k]
            key_string = string.replace(/-/g, '')
        }
        else {
            let string = keywords[k]
            key_string = key_string + '-' + string.replace(/-/g, '')
        }
    }
    for (let k = 0; k < keywords.length; k++) {
        if (getAll.indexOf(keywords[k] != -1)) {
            let getKeyword = await get.keyword_get({ name: keywords[k] })
            let tmp_key = {
                id: getKeyword.getDataValue('id'),
                name: getKeyword.getDataValue('name')
            }
            keyword_list.push(tmp_key)
        }
        else {
            let kk = {
                id: v1(),
                name: keywords[k]
            }
            await create.keyword_create(kk)
            keyword_list.push(kk)
        }
    }

    console.log(`key_string: ${key_string}`)

    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = await rp.catalogParser(catalog)
            console.log(parseData)
            const dataset = await rp.datasetParser(parseData)
            const keyword = await rp.keywordDatasetParser(dataset, keywords)
            console.log(keyword.length)
            let resoucreUrls = []
            // console.log(keyword)
            for (let t = 0; t < keyword.length; t++) {

                let temp = keyword[t]
                const _dataset = temp.dataset
                _dataset.id = v1()
                _dataset.publisher = sourceInfo.realPublisher
                let _distribution = {
                    urls: temp.distribution,
                    dataset_id: _dataset.id,
                    title: _dataset.title
                }
                let key_id
                for (let k = 0; k < keyword_list.length; k++) {
                    if (keyword_list[k]['name'] == _dataset.keyword) {
                        key_id = keyword_list[k]['id']
                    }
                }
                let _datasetKeyword = {
                    id: v1(),
                    dataset_id: _dataset.id,
                    keyword_id: key_id,
                    state: 'active'
                }
                await create.dataset_create(_dataset)
                await create.dataset_keyword_create(_datasetKeyword)
                if (_distribution.urls.length == undefined) {
                    resoucreUrls.push(Object.values(_distribution))
                }
                else {
                    for (let w = 0; w < _distribution.urls.length; w++) {
                        let k = {
                            url: _distribution.urls[w],
                            dataset_id: _distribution.dataset_id,
                            title: _distribution.title
                        }
                        resoucreUrls.push(Object.values(k))
                    }
                }
            }
            // let urlList = []
            // resoucreUrls.forEach((element) => {
            //     urlList = urlList.concat(element);
            // })
            // console.log(urlList)
            // const rList = await rp.keywordDistributionParser(parseData, urlList)

            const rList = await rp.keywordDistToDatabaseParser(parseData, resoucreUrls)
            console.log(rList)
            console.log(`keyword based distribution parsing results: ${rList.length}`)
            for (let a = 0; a < rList.length; a++) {
                let dist = rList[a]
                dist.id = v1()
                dist.publisher = sourceInfo.realPublisher
                await create.distribution_create(dist)
            }
            if (page == 1) {
                const schema = rp.schemaParser(parseData)
                console.log(schema)
            }

            if (rList) {
                const count = rList.length
                const dataset_count = dataset.length
                console.log(`Number of datasets in catalog page ${page}: ${dataset_count}`)
                console.log(`number of including ${keywords} keywords distributions in catalog page ${page}: ${count}`)
                total_count += count
                urlInfo.page = page
                urlInfo.count = count

                const wUrls = await fh.writeDomainUrls(rList, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}

async function downloadDomainUrls(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    // const format = 'CSV'
    let key_string = ""
    // console.log(keywords)
    // console.log(keywords.length)
    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) key_string = keywords[k]
        else key_string = key_string + '_' + keywords[k]
    }
    console.log(key_string)
    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = await rp.catalogParser(catalog)
            const dataset = await rp.datasetParser(parseData)
            const keyword = await rp.keywordParser(dataset, keywords)
            // console.log(keyword.length)
            let resoucreUrls = []
            for (let t = 1; t < keyword.length; t++) {
                let temp = keyword[t]
                if (temp.distribution.length == undefined) {
                    resoucreUrls.push(Object.values(temp.distribution))
                }
                else {
                    for (let w = 0; w < temp.distribution.length; w++) {
                        resoucreUrls.push(Object.values(temp.distribution[w]))
                    }
                }
            }
            let urlList = []
            resoucreUrls.forEach((element) => {
                urlList = urlList.concat(element);
            })
            console.log(urlList.length)
            const rList = await rp.keywordDistributionParser(parseData, urlList)
            // console.log(rList)
            console.log(`keyword based distribution parsing results: ${rList.length}`)

            if (page == 1) {
                const schema = rp.schemaParser(parseData)
                console.log(schema)
            }
            if (rList) {
                const count = rList.length
                const dataset_count = dataset.length
                console.log(`Number of datasets in catalog page ${page}: ${dataset_count}`)
                console.log(`number of including ${keywords} keywords distributions in catalog page ${page}: ${count}`)
                total_count += count
                urlInfo.page = page
                urlInfo.count = count

                const wUrls = await fh.writeDomainUrls(rList, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}

async function socrataKeywordBasedLogic(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    let key_string = ""
    let keyword_list = []
    let getAll = await get.keyword_getAll()

    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) {
            let string = keywords[k]
            key_string = string.replace(/-/g, '')
        }
        else {
            let string = keywords[k]
            key_string = key_string + '-' + string.replace(/-/g, '')
        }
    }
    for (let k = 0; k < keywords.length; k++) {
        if (getAll.indexOf(keywords[k] != -1)) {
            let getKeyword = await get.keyword_get({ name: keywords[k] })
            let tmp_key = {
                id: getKeyword.getDataValue('id'),
                name: getKeyword.getDataValue('name')
            }
            keyword_list.push(tmp_key)
        }
        else {
            let kk = {
                id: v1(),
                name: keywords[k]
            }
            await create.keyword_create(kk)
            keyword_list.push(kk)
        }
    }

    console.log(`key_string: ${key_string}`)

    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = JSON.parse(catalog)
            const dataset = parseData.dataset

            const dataset_count = dataset.length
            const keyword = rp.socrataKeywordDatasetParser(parseData, keywords)

            let resoucreUrls = []
            console.log(keyword.length)
            for (let t = 0; t < keyword.length; t++) {

                let temp = keyword[t]
                const _dataset = temp.dataset
                _dataset.id = v1()
                _dataset.publisher = sourceInfo.realPublisher
                let _distribution = {
                    urls: temp.distribution,
                    dataset_id: _dataset.id,
                    title: _dataset.title,
                    identifier: _dataset.identifier
                }
                let key_id
                for (let k = 0; k < keyword_list.length; k++) {
                    if (keyword_list[k]['name'] == _dataset.keyword) {
                        key_id = keyword_list[k]['id']
                    }
                }
                let _datasetKeyword = {
                    id: v1(),
                    dataset_id: _dataset.id,
                    keyword_id: key_id,
                    state: 'active'
                }

                await create.dataset_create(_dataset)
                await create.dataset_keyword_create(_datasetKeyword)
                if (_distribution.urls.length == undefined) {
                    resoucreUrls.push(Object.values(_distribution))
                }
                else {
                    for (let w = 0; w < _distribution.urls.length; w++) {
                        let k = {
                            url: _distribution.urls[w],
                            dataset_id: _distribution.dataset_id,
                            title: _distribution.title,
                            identifier: _distribution.identifier
                        }
                        resoucreUrls.push(Object.values(k))
                    }
                }
            }

            const rList = await rp.socrataKeywordToDatabaseParser(resoucreUrls)
            // console.log(rList.length)
            console.log(`keyword based distribution parsing results: ${rList.length}`)
            for (let a = 0; a < rList.length; a++) {
                let dist = rList[a]
                if (dist.mediatype != null){
                    dist.id = v1()
                    let check = dist.format
                    dist.format = check.toString().toUpperCase()
                    dist.publisher = sourceInfo.realPublisher
                    await create.distribution_create(dist)
                }
                // console.log(dist)
            }

            if (rList) {
                const count = rList.length
                console.log(`Number of datasets in socrata catalog: ${dataset_count}`)
                console.log(`number of ${keywords} files in socrata catalog: ${count}`)
                urlInfo.count = count
                urlInfo.page = page
                total_count = count

                const wUrls = await fh.writeDomainUrls(rList, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}

async function dkanKeywordBasedLogic(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    let key_string = ""
    let keyword_list = []
    let getAll = await get.keyword_getAll()

    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) {
            let string = keywords[k]
            key_string = string.replace(/-/g, '')
        }
        else {
            let string = keywords[k]
            key_string = key_string + '-' + string.replace(/-/g, '')
        }
    }
    for (let k = 0; k < keywords.length; k++) {
        if (getAll.indexOf(keywords[k] != -1)) {
            let getKeyword = await get.keyword_get({ name: keywords[k] })
            let tmp_key = {
                id: getKeyword.getDataValue('id'),
                name: getKeyword.getDataValue('name')
            }
            keyword_list.push(tmp_key)
        }
        else {
            let kk = {
                id: v1(),
                name: keywords[k]
            }
            await create.keyword_create(kk)
            keyword_list.push(kk)
        }
    }

    console.log(`key_string: ${key_string}`)

    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = JSON.parse(catalog)
            const dataset = parseData.dataset

            const dataset_count = dataset.length
            const keyword = rp.socrataKeywordDatasetParser(parseData, keywords)
            // console.log(keyword)
            let resoucreUrls = []
            console.log(keyword.length)
            for (let t = 0; t < keyword.length; t++) {

                let temp = keyword[t]
                const _dataset = temp.dataset
                _dataset.id = v1()
                _dataset.publisher = sourceInfo.realPublisher
                let _distribution = {
                    urls: temp.distribution,
                    dataset_id: _dataset.id,
                    title: _dataset.title,
                    identifier: _dataset.identifier
                }
                let key_id
                for (let k = 0; k < keyword_list.length; k++) {
                    if (keyword_list[k]['name'] == _dataset.keyword) {
                        key_id = keyword_list[k]['id']
                    }
                }
                let _datasetKeyword = {
                    id: v1(),
                    dataset_id: _dataset.id,
                    keyword_id: key_id,
                    state: 'active'
                }

                // let getDataset = get.dataset_get({url: _dataset.url})
                // // let id = getDataset.getDataValue('id')
                // if (getDataset == undefined){
                //     let id = getDataset.getDataValue('id')
                //     console.log(`This dataset is already exists: ${id}`)
                //     _dataset.id = null
                // } else {
                //     // console.log(getDataset.getDataValue('id'))
                //     console.log('not null dataset id')
                //     console.log(getDataset)
                // }
                await create.dataset_create(_dataset)
                await create.dataset_keyword_create(_datasetKeyword)
                if (_distribution.urls != undefined) {
                    const count = Object.keys(_distribution.urls).length;

                    if (count == undefined) {
                        resoucreUrls.push(Object.values(_distribution))
                        // console.log(`undefined: count = ${count}`)
                    }
                    else {
                        // console.log(`count = ${count}`)
                        for (let w = 0; w < count; w++) {
                            let k = {
                                url: _distribution.urls[w],
                                dataset_id: _distribution.dataset_id,
                                title: _distribution.title,
                                identifier: _distribution.identifier
                            }
                            resoucreUrls.push(Object.values(k))
                        }
                    }
                }

            }
            // console.log(resoucreUrls)
            const rList = await rp.socrataKeywordToDatabaseParser(resoucreUrls)
            // console.log(rList.length)
            console.log(`keyword based distribution parsing results: ${rList.length}`)
            for (let a = 0; a < rList.length; a++) {
                let dist = rList[a]
                if (dist.mediatype != null){
                    dist.id = v1()
                    let check = dist.format
                    dist.format = check.toString().toUpperCase()
                    dist.publisher = sourceInfo.realPublisher
                    await create.distribution_create(dist)
                }
                // console.log(dist)
            }
            if (rList) {
                const count = rList.length
                console.log(`Number of datasets in socrata catalog: ${dataset_count}`)
                console.log(`number of ${keywords} files in socrata catalog: ${count}`)
                urlInfo.count = count
                urlInfo.page = page
                total_count = count

                const wUrls = await fh.writeDomainUrls(rList, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}

async function arcgisKeywordBasedLogic(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    let key_string = ""
    let keyword_list = []
    let getAll = await get.keyword_getAll()

    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) {
            let string = keywords[k]
            key_string = string.replace(/-/g, '')
        }
        else {
            let string = keywords[k]
            key_string = key_string + '-' + string.replace(/-/g, '')
        }
    }
    for (let k = 0; k < keywords.length; k++) {
        if (getAll.indexOf(keywords[k] != -1)) {
            let getKeyword = await get.keyword_get({ name: keywords[k] })
            let tmp_key = {
                id: getKeyword.getDataValue('id'),
                name: getKeyword.getDataValue('name')
            }
            keyword_list.push(tmp_key)
        }
        else {
            let kk = {
                id: v1(),
                name: keywords[k]
            }
            await create.keyword_create(kk)
            keyword_list.push(kk)
        }
    }

    console.log(`key_string: ${key_string}`)

    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = JSON.parse(catalog)
            const dataset = parseData.dataset

            const dataset_count = dataset.length
            const keyword = rp.socrataKeywordDatasetParser(parseData, keywords)

            let resoucreUrls = []
            console.log(keyword.length)
            for (let t = 0; t < keyword.length; t++) {

                let temp = keyword[t]
                const _dataset = temp.dataset
                _dataset.id = v1()
                _dataset.publisher = sourceInfo.realPublisher
                let _distribution = {
                    urls: temp.distribution,
                    dataset_id: _dataset.id,
                    title: _dataset.title,
                    identifier: _dataset.identifier
                }
                let key_id
                for (let k = 0; k < keyword_list.length; k++) {
                    if (keyword_list[k]['name'] == _dataset.keyword) {
                        key_id = keyword_list[k]['id']
                    }
                }
                let _datasetKeyword = {
                    id: v1(),
                    dataset_id: _dataset.id,
                    keyword_id: key_id,
                    state: 'active'
                }

                await create.dataset_create(_dataset)
                await create.dataset_keyword_create(_datasetKeyword)
                if (_distribution.urls.length == undefined) {
                    resoucreUrls.push(Object.values(_distribution))
                }
                else {
                    for (let w = 0; w < _distribution.urls.length; w++) {
                        let k = {
                            url: _distribution.urls[w],
                            dataset_id: _distribution.dataset_id,
                            title: _distribution.title,
                            identifier: _distribution.identifier
                        }
                        resoucreUrls.push(Object.values(k))
                    }
                }
            }

            const rList = await rp.arcgisKeywordToDatabaseParser(resoucreUrls)
            // console.log(rList.length)
            console.log(`keyword based distribution parsing results: ${rList.length}`)
            for (let a = 0; a < rList.length; a++) {
                let dist = rList[a]
                if (dist.mediatype != null){
                    dist.id = v1()
                    let check = dist.format
                    dist.format = check.toString().toUpperCase()
                    dist.publisher = sourceInfo.realPublisher
                    await create.distribution_create(dist)
                }
                console.log(dist)
            }

            if (rList) {
                const count = rList.length
                console.log(`Number of datasets in arcgis catalog: ${dataset_count}`)
                console.log(`number of ${keywords} files in arcgis catalog: ${count}`)
                urlInfo.count = count
                urlInfo.page = page
                total_count = count

                const wUrls = await fh.writeDomainUrls(rList, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}

async function odsKeywordBasedLogic(sourceInfo, keywords, end) {

    const dataDir = defaultPath
    let key_string = ""
    let keyword_list = []
    let getAll = await get.keyword_getAll()

    for (let k = 0; k < keywords.length; k++) {
        if (k == 0) {
            let string = keywords[k]
            key_string = string.replace(/-/g, '')
        }
        else {
            let string = keywords[k]
            key_string = key_string + '-' + string.replace(/-/g, '')
        }
    }
    for (let k = 0; k < keywords.length; k++) {
        if (getAll.indexOf(keywords[k] != -1)) {
            let getKeyword = await get.keyword_get({ name: keywords[k] })
            let tmp_key = {
                id: getKeyword.getDataValue('id'),
                name: getKeyword.getDataValue('name')
            }
            keyword_list.push(tmp_key)
        }
        else {
            let kk = {
                id: v1(),
                name: keywords[k]
            }
            await create.keyword_create(kk)
            keyword_list.push(kk)
        }
    }

    console.log(`key_string: ${key_string}`)

    const urlInfo = {
        name: sourceInfo.name,
        type: 'domain',
        keywords: key_string,
        publisher: sourceInfo.publisher
    }
    let total_count = 0
    for (let page = 1; page <= end; page++) {
        sourceInfo.page = page
        const catalog = await fh.readCatalog(dataDir, sourceInfo)
        // console.log(catalog)
        if (!catalog) {
            console.log(`read data is failed`)
        } else {
            const parseData = JSON.parse(catalog)
            const dataset = parseData.dataset
            // console.log(dataset)
            const dataset_count = dataset.length
            const keyword = rp.odsKeywordDatasetParser(dataset, keywords)
            // console.log(keyword)
            let resoucreUrls = []
            console.log(keyword.length)
            for (let t = 0; t < keyword.length; t++) {

                let temp = keyword[t]
                const _dataset = temp.dataset
                _dataset.id = v1()
                _dataset.publisher = sourceInfo.realPublisher
                let _distribution = {
                    urls: temp.distribution,
                    dataset_id: _dataset.id,
                    title: _dataset.title,
                    identifier: _dataset.url
                }
                let key_id
                for (let k = 0; k < keyword_list.length; k++) {
                    if (keyword_list[k]['name'] == _dataset.keyword) {
                        key_id = keyword_list[k]['id']
                    }
                }
                let _datasetKeyword = {
                    id: v1(),
                    dataset_id: _dataset.id,
                    keyword_id: key_id,
                    state: 'active'
                }

                await create.dataset_create(_dataset)
                await create.dataset_keyword_create(_datasetKeyword)
                // if( t % 100 == 0) {
                //     console.log(_distribution)}
                if (_distribution.urls.length == undefined) {
                    resoucreUrls.push(Object.values(_distribution))
                }
                else {
                    for (let w = 0; w < _distribution.urls.length; w++) {
                        let k = {
                            url: _distribution.urls[w],
                            dataset_id: _distribution.dataset_id,
                            title: _distribution.title,
                            identifier: _distribution.identifier
                        }
                        resoucreUrls.push(Object.values(k))
                    }
                }
            }
            // console.log(resoucreUrls)
            const rList = await rp.odsKeywordToDatabaseParser(resoucreUrls)
            // console.log(rList)
            console.log(`keyword based distribution parsing results: ${rList.length}`)
            let rdist = []
            for (let a = 0; a < rList.length; a++) {
                let dist = rList[a]
                if (dist.url != undefined){
                    dist.id = v1()
                    let check = dist.format
                    dist.format = check.toString().toUpperCase()
                    if(dist.mediatype == undefined){
                        dist.mediatype = mime.lookup(check)
                    }
                    dist.publisher = sourceInfo.realPublisher
                    // console.log(dist)
                    rdist.push(dist)
                    await create.distribution_create(dist)
                }
            }
            console.log(`keyword based real distribution parsing results: ${rdist.length}`)


            if (rdist) {
                const count = rdist.length
                console.log(`Number of datasets in arcgis catalog: ${dataset_count}`)
                console.log(`number of ${keywords} files in arcgis catalog: ${count}`)
                urlInfo.count = count
                urlInfo.page = page
                total_count = count

                const wUrls = await fh.writeDomainUrls(rdist, urlInfo)
                if (wUrls) {
                    console.log(`write urls to files is succeeded`)
                }
            }
        }
    }
    console.log(`total ${urlInfo.type} files in ${sourceInfo.publisher} open data portal: ${total_count}`)
    return total_count
}