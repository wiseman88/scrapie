import * as cheerio from 'cheerio'
import fs from 'fs'

const getPrice = (price) => {
  const rawPrice = price / 2
  const svkPrice = Number(rawPrice.toFixed(2))

  return svkPrice
}

function extractDataFromHTML(html) {
  const $ = cheerio.load(html)
  const name = $('meta[property="og:title"]').attr('content')
  const desc = $('[data-box-name="Description"]>div>div>div>div>div>')
  const description = desc.clone().find('img').remove().end()
  const shortDescription = ''
  const url = $('link[rel="canonical"]').attr('data-savepage-href')
  const original_sku = url.match(/\d+$/)[0]
  const sku = '21' + original_sku
  const attributeSetCode = 'Default'
  const productType = 'simple'
  const categories = ''
  const productWebsites = 'svk'
  const productOnline = 2
  const taxClassName = 'Taxable Goods'
  const visibility = 'Catalog, Search'
  // Get price in euros
  const price = getPrice($('meta[itemprop="price"]').attr('content'))

  return {
    name,
    shortDescription,
    description,
    url,
    original_sku,
    sku,
    attributeSetCode,
    productType,
    categories,
    productWebsites,
    productOnline,
    taxClassName,
    visibility,
    price,
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
    'sku,attribute_set_code,product_type,categories,product_websites,name,short_description,description,product_online,tax_class_name,visibility,price,xxx_original_url,xxx_original_sku\n'

  data.forEach((item) => {
    const name = `"${item.name}"`
    const url = `"${item.url}"`
    const sku = `"${item.sku}"`
    const original_sku = `"${item.original_sku}"`
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

    const description = cleanedHtmlString.replace(/<\/?div[^>]*>\s*/gi, '')

    csv += `${sku},${attributeSetCode},${productType},${categories},${productWebsites},${name},${shortDescription},${description},${productOnline},${taxClassName},${visibility},${price},${url},${original_sku}\n`
  })

  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const fileName = `output_${timestamp}.csv`

  fs.writeFileSync(fileName, csv, 'utf-8')
}

const extractedData = readHTMLFiles()
saveDataToCSV(extractedData)
