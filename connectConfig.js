const apiVersion = "2006-03-01"
const accessKeyId = process.env.ACCESS_KEY 
const secretAccessKey = process.env.SECRET_KEY 
const endpoint = process.env.ENDPOINT
const s3ForcePathStyle = true
const sslEnabled = false
const signatureVersion = "v4"

const USsourceInfo = {
    defaultUrl: "https://data.gov/catalog.rdf",
    type: 'catalog',
    name: 'us_catalog',
    publisher: 'ODLC/US',
    site: 'us',
    realPublisher: 'data.gov'
}

const keywords = ['covid-19', 'health'] 
const usBucket = 'us-ckan'

// const condition = 'AND'
// const nyBucket = 'ny-socrata'
// const hhsBucket = 'hhs-us-dkan'
// const dcBucket = 'dc-us-arcgis'
// const lcBucket = 'lc-uk-opendatasoft'

exports.apiVersion = apiVersion
exports.accessKeyId = accessKeyId
exports.secretAccessKey = secretAccessKey
exports.endpoint = endpoint
exports.s3ForcePathStyle = s3ForcePathStyle
exports.sslEnabled = sslEnabled
exports.signatureVersion = signatureVersion
exports.USsourceInfo = USsourceInfo
exports.keywords = keywords
exports.usBucket = usBucket