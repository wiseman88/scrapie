import * as cheerio from 'cheerio'
import fs from 'fs'

function extractDataFromHTML(html) {
  const $ = cheerio.load(html)
  const title = $('title').text()
  const desc = $('[data-box-name="Description"]>div>div>div>div>div>')
  const description = desc.clone().find('img').remove().end()
  const shortDescription = $('meta[name="short_description"]').attr('content')
  const url = $('link[rel="canonical"]').attr('data-savepage-href')
  const original_sku = url.match(/\d+$/)[0]
  const sku = '21' + original_sku
  const randomItem = 'random item'

  return {
    title,
    shortDescription,
    description,
    url,
    original_sku,
    sku,
    randomItem,
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
    'title,url,sku,original_sku,short_description,description,randomItem\n'

  data.forEach((item) => {
    const title = `"${item.title}"`
    const url = `"${item.url}"`
    const sku = `"${item.sku}"`
    const original_sku = `"${item.original_sku}"`
    const cleanedHtmlString = `"${String(item.description).replace(
      /"/g,
      '""'
    )}"`
    const shortDescription = `"${item.shortDescription}"`
    const randomItem = `"${item.randomItem}"`

    const description = cleanedHtmlString.replace(/<\/?div[^>]*>\s*/gi, '')

    csv += `${title},${url},${sku},${original_sku},${shortDescription},${description},${randomItem}\n`
  })

  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const fileName = `output_${timestamp}.csv`

  fs.writeFileSync(fileName, csv, 'utf-8')
}

const extractedData = readHTMLFiles()
saveDataToCSV(extractedData)
