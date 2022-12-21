const config = require('../config/openDataConfig')
const dd = require('./dataHarvester/domain-downloader')
const mklake = require('./dataLakeConstructor/S3-handler')
const conConfig = require('./connectConfig')

async function main() {

    // const catalog = await dd.downloadAllCatalog(USsourceInfo, 10)

    // Add metadata manager logic --> stage (gathering, extraction)
    await dd.datasetToDatabaseKeyword(conConfig.USsourceInfo, conConfig.keywords, 1)

    // Add socrata processing logic
    // await dd.socrataKeywordBasedLogic(NYsourceInfo, keywords, 1)

    // Add dkan processing logic
    // await dd.dkanKeywordBasedLogic(HHSsourceInfo, keywords, 1)

    // Add arcgis processing logic
    // await dd.arcgisKeywordBasedLogic(DCsourceInfo, keywords, 1)

    // Add ods processing logic
    // await dd.odsKeywordBasedLogic(LCsourceInfo, keywords, 1)

    // Add metadata manager logic --> stage (storing)
    // This function performs the same regardless of platform

    await mklake.createDomainDataLakes(conConfig.USsourceInfo, conConfig.keywords, conConfig.usBucket)

}
if (require.main == module) {
    main()
}