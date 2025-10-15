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
        left: 270.27mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -14.78mm;
        width: 68.00mm;
        height: 29.55mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Signature of the person by whom Buried</div>
      </div>
      <div class="text-frame" style="
        left: 243.25mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -12.25mm;
        width: 68.00mm;
        height: 24.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Where Buried</div>
      </div>
      <div class="text-frame" style="
        left: 222.75mm;
        top: 121.00mm;
        margin-left: -34.00mm;
        margin-top: -8.25mm;
        width: 68.00mm;
        height: 16.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Mother Name</div>
      </div>
      <div class="text-frame" style="
        left: 206.25mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -8.25mm;
        width: 68.00mm;
        height: 16.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Father Name</div>
      </div>
      <div class="text-frame" style="
        left: 184.25mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -13.75mm;
        width: 68.00mm;
        height: 27.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Cause of Death</div>
      </div>
      <div class="text-frame" style="
        left: 156.75mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -13.75mm;
        width: 68.00mm;
        height: 27.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Profession</div>
      </div>
      <div class="text-frame" style="
        left: 132.25mm;
        top: 121.00mm;
        margin-left: -34.00mm;
        margin-top: -10.75mm;
        width: 68.00mm;
        height: 21.50mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Age</div>
      </div>
      <div class="text-frame" style="
        left: 112.62mm;
        top: 121.25mm;
        margin-left: -34.00mm;
        margin-top: -8.88mm;
        width: 68.00mm;
        height: 17.75mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Sex</div>
      </div>
      <div class="text-frame" style="
        left: 88.97mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -14.78mm;
        width: 68.00mm;
        height: 29.55mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Name of the Person died</div>
      </div>
      <div class="text-frame" style="
        left: 62.65mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -11.55mm;
        width: 68.00mm;
        height: 23.10mm;
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
        ">When Buried</div>
      </div>
      <div class="text-frame" style="
        left: 26.25mm;
        top: 184.75mm;
        width: 49.70mm;
        height: 7.55mm;
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
        ">Place of Certificate Issue</div>
      </div>
      <div class="text-frame" style="
        left: 25.75mm;
        top: 176.25mm;
        width: 49.70mm;
        height: 7.55mm;
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
        ">Date of Certificate Issue</div>
      </div>
      <div class="text-frame" style="
        left: 39.55mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -11.55mm;
        width: 68.00mm;
        height: 23.10mm;
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
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Date of Death</div>
      </div>
      <div class="text-frame" style="
        left: 20.35mm;
        top: 120.50mm;
        margin-left: -34.00mm;
        margin-top: -7.65mm;
        width: 68.00mm;
        height: 15.30mm;
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
        ">Number</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 160.45mm;
        width: 271.72mm;
        height: 12.80mm;
        border: 0.35mm solid #000000;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">I REV.A.JEBARATHINAM hereby certify that the above is a true extract from the Register of Burials kept at THE PASTORATE OFFICE, SAMBAVARVADAKARAI.</div>
      </div>
      <div class="text-frame" style="
        left: 13.19mm;
        top: 22.00mm;
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
        left: 0.00mm;
        top: 0.00mm;
        width: 297.05mm;
        height: 210.00mm;
      "></div>
      <div class="image-frame" style="
        left: 0.00mm;
        top: 0.00mm;
        width: 297.05mm;
        height: 210.00mm;
        overflow: hidden;
      ">
        <img src="D:/Reports/burial_reg.png" style="width: 100%; height: 100%; object-fit: cover;" />
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