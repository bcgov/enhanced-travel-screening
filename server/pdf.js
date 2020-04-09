const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const frontendUrl = process.env.FE_URL || 'http://localhost:80';

// Creates headless browser to hit FE PDF render route
// Uses JWT access token in URL
// FE fetches data from API using JWT
const createPdf = async (id, accessToken) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${frontendUrl}/renderpdf/${id}/${accessToken}`, {
      waitUntil: 'networkidle2',
    });
    await page.setViewport({ width: 1680, height: 1050 });
    if (!fs.existsSync('./pdfs')) fs.mkdirSync('./pdfs');
    const pdfPath = path.join(__dirname, 'pdfs', `travellerScreeningReport-${id}.pdf`);
    const pdf = await page.pdf({
      path: pdfPath,
      format: 'A4',
    });
    await browser.close();
    return { path: pdfPath, length: pdf.length };
  } catchh (error) {
    console.error(error);
    return error
  }
};

module.exports = createPdf;
