import * as cheerio from 'cheerio'
import fs from 'fs'

const getPrice = (price) => {
  const rawPrice = price / 2
  const svkPrice = Number(rawPrice.toFixed(2))

  return svkPrice
}

const getUrl = (url) => {
  const allegroUrl = url

  return allegroUrl
}

const getSku = (url) => {
  const sku = url.match(/\d+$/)[0]

  return sku
}

const getRating = (min, max) => {
  const randomNumber = Math.random() * (max - min) + min

  const roundedNumber = Number(randomNumber.toFixed(2))

  return roundedNumber
}

const getSold = () => {
  const randomNumber = Math.floor(Math.random() * 200) + 1

  return randomNumber
}

const getAddAttributes = (url) => {
  const skladom = 0
  const originalSku = getSku(url)
  const originalUrl = getUrl(url)
  const rating = getRating(4.5, 5.0)
  const sold = getSold()
  const incoming = 0

  return `xxx_skladom=${skladom},xxx_original_sku=${originalSku},xxx_original_url=${originalUrl},xxx_rating=${rating},xxx_sold=${sold},xxx_incoming=${incoming}`
}

function extractDataFromHTML(html) {
  const $ = cheerio.load(html)
  const name = $('meta[property="og:title"]').attr('content')
  const desc = $('[data-box-name="Description"]>div>div>div>div>div>')
  const description = desc.clone().find('img').remove().end()
  const shortDescription = ''
  const attributeSetCode = 'Default'
  const productType = 'simple'
  const categories = ''
  const productWebsites = 'svk'
  const productOnline = 2
  const taxClassName = 'Taxable Goods'
  const visibility = 'Catalog, Search'
  // Get price in euros
  const price = getPrice($('meta[itemprop="price"]').attr('content'))
  // Get url
  const url = getUrl($('link[rel="canonical"]').attr('data-savepage-href'))
  // Get Originial SKU
  const original_sku = getSku(url)
  // Get SKU
  const sku = '21' + original_sku
  // Get additional attributes
  const additionalAttributes = getAddAttributes(
    $('link[rel="canonical"]').attr('data-savepage-href')
  )

  return {
    name,
    shortDescription,
    description,
    sku,
    attributeSetCode,
    productType,
    categories,
    productWebsites,
    productOnline,
    taxClassName,
    visibility,
    price,
    additionalAttributes,
  }
}

function readHTMLFiles() {
  const htmlFiles = fs.readdirSync('data')

  const data = []

  htmlFiles.forEach((file) => {
    const html = fs.readFileSync(`data/${file}`, 'utf-8')
    const extractedData = extractDataFromHTML(html)
    data.push(extractedData)
  })

  return data
}

function saveDataToCSV(data) {
  let csv =
    'sku,attribute_set_code,product_type,categories,product_websites,name,short_description,description,product_online,tax_class_name,visibility,price,additional_attributes\n'

  data.forEach((item) => {
    const name = `"${item.name}"`
    const sku = `"${item.sku}"`
    const cleanedHtmlString = `"${String(item.description).replace(
      /"/g,
      '""'
    )}"`
    const shortDescription = `"${item.shortDescription}"`
    const attributeSetCode = `"${item.attributeSetCode}"`
    const productType = `"${item.productType}"`
    const categories = `"${item.categories}"`
    const productWebsites = `"${item.productWebsites}"`
    const productOnline = `"${item.productOnline}"`
    const taxClassName = `"${item.taxClassName}"`
    const visibility = `"${item.visibility}"`
    const price = `"${item.price}"`
    const additionalAttributes = `"${item.additionalAttributes}"`

    const description = cleanedHtmlString.replace(/<\/?div[^>]*>\s*/gi, '')

    csv += `${sku},${attributeSetCode},${productType},${categories},${productWebsites},${name},${shortDescription},${description},${productOnline},${taxClassName},${visibility},${price},${additionalAttributes}\n`
  })

  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const fileName = `output_${timestamp}.csv`

  fs.writeFileSync(fileName, csv, 'utf-8')
}

const extractedData = readHTMLFiles()
saveDataToCSV(extractedData)
