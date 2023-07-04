import * as cheerio from 'cheerio'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'

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

async function downloadImages(urls, folderPath) {
  !fs.existsSync(folderPath)
    ? fs.mkdirSync(folderPath, { recursive: true })
    : fs.mkdirSync(folderPath + '_' + Date.now(), { recursive: true })

  for (const url of urls) {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()

    const filename = url.substring(url.lastIndexOf('/') + 1)
    const filepath = path.join(folderPath, filename)

    fs.writeFileSync(filepath, Buffer.from(buffer))
  }
}

function extractDataFromHTML(html) {
  const $ = cheerio.load(html)
  const name = $('meta[property="og:title"]').attr('content')
  const desc = $('[data-box-name="Description"]>div>div>div>div>div>')
  const description = desc.clone().find('img').remove().end()

  // Get images of product
  const images = desc.find('img[data-savepage-src]')
  const additionalImages = []
  images.each((index, element) => {
    const src = $(element).attr('data-savepage-src')
    additionalImages.push(src)
  })

  downloadImages(additionalImages, './imgs/' + name)

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
    additionalImages,
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
    'sku,attribute_set_code,product_type,categories,product_websites,name,short_description,description,product_online,tax_class_name,visibility,price,url_key,base_image,small_image,thumbnail_image,additional_attributes,qty,out_of_stock_qty,use_config_min_qty,is_qty_decimal,allow_backorders,use_config_backorders,min_cart_qty,use_config_min_sale_qty,max_cart_qty,use_config_max_sale_qty,is_in_stock,notify_on_stock_below,use_config_notify_stock_qty,manage_stock,use_config_manage_stock,use_config_qty_increments,qty_increments,use_config_enable_qty_inc,enable_qty_increments,is_decimal_divided,website_id,additional_images\n'

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
    const urlKey = ''
    const baseImage = ''
    const smallImage = ''
    const thumbnailImage = ''
    const additionalAttributes = `"${item.additionalAttributes}"`
    const additionalImages = `"${item.additionalImages}"`

    const description = cleanedHtmlString.replace(/<\/?div[^>]*>\s*/gi, '')

    csv += `${sku},${attributeSetCode},${productType},${categories},${productWebsites},${name},${shortDescription},${description},${productOnline},${taxClassName},${visibility},${price},${urlKey},${baseImage},${smallImage},${thumbnailImage},${additionalAttributes},"99999","0","1","0","0","1","1","1","10000","1","1","1","1","0","1","1","1","1","0","0","0",${additionalImages}\n`
  })

  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const fileName = `output_${timestamp}.csv`

  fs.writeFileSync(fileName, csv, 'utf-8')
}

const extractedData = readHTMLFiles()
saveDataToCSV(extractedData)
