// Install: npm install puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');

async function generateTamilPDF() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @font-face {
          font-family: 'Vijaya';
          src: url('./Vijaya.ttf') format('truetype');
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 297.00mm;
          height: 210.00mm;
          position: relative;
          overflow: hidden;
        }
        .text-frame {
          position: absolute;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .text-content {
          width: 100%;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .shape {
          position: absolute;
        }
        .line {
          position: absolute;
        }
        .table-cell {
          position: absolute;
          overflow: hidden;
        }
        .image-frame {
          position: absolute;
        }
      </style>
    </head>
    <body>
      <div class="text-frame" style="
        left: 269.79mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -14.40mm;
        width: 68.00mm;
        height: 28.80mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Rev. Samuel</div>
      </div>
      <div class="text-frame" style="
        left: 243.29mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -12.10mm;
        width: 68.00mm;
        height: 24.20mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Nallur</div>
      </div>
      <div class="text-frame" style="
        left: 224.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Spoken World</div>
      </div>
      <div class="text-frame" style="
        left: 211.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Lord of Lord</div>
      </div>
      <div class="text-frame" style="
        left: 198.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">King of Kings</div>
      </div>
      <div class="text-frame" style="
        left: 185.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Rajini</div>
      </div>
      <div class="text-frame" style="
        left: 172.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Selvaraj</div>
      </div>
      <div class="text-frame" style="
        left: 155.64mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -10.55mm;
        width: 68.00mm;
        height: 21.10mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Ministry</div>
      </div>
      <div class="text-frame" style="
        left: 138.14mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.95mm;
        width: 68.00mm;
        height: 13.90mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Nallur</div>
      </div>
      <div class="text-frame" style="
        left: 124.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.50mm;
        width: 68.00mm;
        height: 13.00mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">28</div>
      </div>
      <div class="text-frame" style="
        left: 111.24mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -6.95mm;
        width: 68.00mm;
        height: 13.90mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Male</div>
      </div>
      <div class="text-frame" style="
        left: 92.19mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -12.10mm;
        width: 68.00mm;
        height: 24.20mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Sujith S</div>
      </div>
      <div class="text-frame" style="
        left: 65.69mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -14.40mm;
        width: 68.00mm;
        height: 28.80mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Sujith S</div>
      </div>
      <div class="text-frame" style="
        left: 39.49mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -11.80mm;
        width: 68.00mm;
        height: 23.60mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">25-12-2025</div>
      </div>
      <div class="text-frame" style="
        left: 27.69mm;
        top: 184.77mm;
        width: 69.50mm;
        height: 7.62mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">25-12-2025</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 156.96mm;
        width: 271.49mm;
        height: 13.00mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">I Rev. Samuel hereby certify that the above is a true extract from the Register of Baptism kept at THE PASTORATE OFFICE, SAMBAVARVADAKARAI.</div>
      </div>
      <div class="text-frame" style="
        left: 27.69mm;
        top: 176.27mm;
        width: 69.50mm;
        height: 7.62mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Nallur</div>
      </div>
      <div class="text-frame" style="
        left: 20.29mm;
        top: 120.77mm;
        margin-left: -34.00mm;
        margin-top: -7.40mm;
        width: 68.00mm;
        height: 14.80mm;
        transform: rotate(-90.0deg);
        transform-origin: center center;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">151</div>
      </div>
      <div class="text-frame" style="
        left: 13.38mm;
        top: 22.01mm;
        width: 271.03mm;
        height: 7.62mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          font-size: 14.2pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
          line-height: 1.67;
        ">Tenkasi North Zion Nagar Pastorate</div>
      </div>
      <div class="shape" style="
        left: 0.19mm;
        top: 0.02mm;
        width: 297.00mm;
        height: 209.97mm;
      "></div>
      <div class="image-frame" style="
        left: 0.19mm;
        top: 0.02mm;
        width: 297.00mm;
        height: 209.97mm;
        overflow: hidden;
      ">
        <img src="D:/Reports/baptsm_adult.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
    </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: 'tamil-output.pdf',
    width: '297.00mm',
    height: '210.00mm',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });

  await browser.close();
  console.log('PDF generated successfully!');
}

generateTamilPDF().catch(console.error);