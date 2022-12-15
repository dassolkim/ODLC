const fs = require('fs')
const path = require('path')
const dataDir = path.join('C:/Users/kimds/nodeProject', 'data/')

module.exports = { readCatalog, writeDomainUrls, readDomainUrls, readDirs }


function readCatalog(dataDir, sourceInfo) {

    try {
        const type = sourceInfo.type
        const publisher = sourceInfo.publisher
        const dir = dataDir + type + '/' + publisher
        // const dir = dataDir + type
        const exist = fs.existsSync(dir)
        // console.log(exist)
        if (!exist) fs.mkdirSync(dir)
        // console.log(`directory path: ${dir}`)
        const file = dir + '/' + 'p_' + sourceInfo.page + '_' + sourceInfo.name + '.rdf'
        console.log(`file path: ${file}`)

        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf-8')
            console.log(typeof (data))
            return data
        } else {
            return false
        }

    } catch (err) {
        console.log(err)
    }
}


function writeDomainUrls(data, sourceInfo) {

    try {
        const type = sourceInfo.type
        const publisher = sourceInfo.publisher
        const dir = dataDir + type + '/' + publisher + '/' + sourceInfo.keywords
        const exist = fs.existsSync(dir)
        if (!exist) fs.mkdirSync(dir)
        const file = dir + '/' + 'p_' + sourceInfo.page + '_' + sourceInfo.keywords + '_' + sourceInfo.name + '_url.txt'
        console.log(`file path: ${file}`)
        const urls = {
            info: sourceInfo,
            urls: data
        }
        fs.writeFileSync(file, JSON.stringify(urls))
        if (fs.existsSync(file)) {
            return true
        } else {
            return false
        }
    } catch (err) {
        console.log(err)
    }
}

function readDomainUrls(dataDir, sourceInfo, key_string) {

    try {
        const type = sourceInfo.type
        const publisher = sourceInfo.publisher
        const dir = dataDir + type + '/' + publisher + '/' + key_string
        // const dir = dataDir + type
        const exist = fs.existsSync(dir)
        if (!exist) fs.mkdirSync(dir)
        // console.log(exist)
        // console.log(`directory path: ${dir}`)
        const file = dir + '/' + 'p_' + sourceInfo.page + '_' + key_string + '_' + sourceInfo.name + '_url.txt'
        console.log(`file path: ${file}`)

        if (fs.existsSync(file)) {
            const data = fs.readFileSync(file, 'utf-8')
            // console.log(typeof (data))
            return data
        } else {
            return false
        }

    } catch (err) {
        console.log(err)
    }
}

function readDirs(dataDir, sourceInfo) {

    try {
        const type = sourceInfo.type
        const publisher = sourceInfo.publisher
        const dir = dataDir + type + '/' + publisher + '/' + sourceInfo.format + '/sourceList/' + sourceInfo.dirType

        // const file = dir + '/' + 'p_' + sourceInfo.page + '_' + sourceInfo.format + '_' + sourceInfo.name + '_sourceList.txt'
        // console.log(`file path: ${file}`)

        if (fs.existsSync(dir)) {
            const data = fs.readdirSync(dir)
            // const length = data.length
            // console.log(typeof (data))
            return data
        } else {
            return false
        }
    } catch (err) {
        console.log(err)
    }
}
