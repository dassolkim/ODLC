const S3Client = require('./S3-client')
const path = require('path')
const defaultPath = path.join('C:/Users/kimds/nodeProject', 'data/')
const fh = require('../fileHandler/file-handler')
const dc = require('../dataHarvester/data-collector')
const create = require('../metadataManager/action/create')
const update = require('../metadataManager/action/update')
const get = require('../metadataManager/action/get')
const uuid = require('uuid')

module.exports = { createDomainDataLakes }

async function createDomainDataLakes(sourceInfo, keywords, bucket) {
    const urlInfo = sourceInfo
    urlInfo.type = 'domain'
    const dataDir = defaultPath
    let global_cnt = 0
    let original_cnt = 0
    const rp = [1]
    this.s3 = new S3Client()
    let key_string = ""
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
    console.log(key_string)
    await this.s3.connect()
    let _datalake = {}
    const new_bucket = key_string + '/' + bucket
    let getDatalake = await get.datalake_get({ bucket: new_bucket })
    console.log(`check query raw reaturn: ${getDatalake}`)

    let check_lake
    if (getDatalake != null) {
        check_lake = getDatalake.getDataValue('bucket')
        console.log(check_lake)
        if (check_lake == new_bucket) {
            _datalake = {
                id: getDatalake.getDataValue('id'),
                bucket: getDatalake.getDataValue('bucket')
            }
            console.log(`The bucket name ${check_lake} is already exist`)
        }
    } else {
        _datalake = {
            id: uuid.v1(),
            bucket: new_bucket,
            type: 'keyword',
            state: 'active'
        }
        await create.datalake_create(_datalake)
        console.log('create new_bucket')
    }

    for (let p = 0; p < rp.length; p++) {
        const pg = rp[p]
        urlInfo.page = pg
        const name = `${sourceInfo.site}_p${pg}_${key_string}_`
        const readUrls = fh.readDomainUrls(dataDir, urlInfo, key_string)
        const urlObj = JSON.parse(readUrls)
        const count = urlObj.info.count
        console.log(`Number of ${key_string} file in ${urlInfo.publisher} portal catalog page ${urlInfo.page}: ${count}`)
        let i = 0
        let j = 0
        let cnt = 0
        original_cnt += count
        while (i < count) {
            const obj = urlObj.urls[i]
            j = i + 1
            const url = obj.url
            const mediaType = obj.mediatype
            const format = obj.format
            const object_name = name + format + '_' + j

            const data = await dc.getRealDataToFile(url)

            console.log(object_name)
            const result = this.s3.putObject(_datalake.bucket, object_name, data, mediaType)
            if (result != null) {
                cnt++
                const _distribution = {
                    id: obj.id,
                    datalake_id: _datalake.id,
                    name: object_name
                }
                let dist = get.distribution_get({ id: _distribution.id })
                let check_dist = dist.datalake_id

                if (check_dist != null || check_dist == undefined) {
                    await update.distribution_update(_distribution)
                    console.log("we did update ")
                }
            }

            i++
        }
        global_cnt += cnt
    }
    console.log(`Number of ${key_string} files in ${sourceInfo.publisher} portal: ${original_cnt}`)
    console.log(`Number of created sources in ${sourceInfo.publisher} portal ${key_string} files: ${global_cnt}`)
}