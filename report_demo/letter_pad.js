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
          width: 210.00mm;
          height: 297.00mm;
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
        left: 12.70mm;
        top: 87.00mm;
        width: 184.60mm;
        height: 197.30mm;
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
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Subject: Request for Support and Participation in Our Harvest Festival

Dear Beloved in Christ,

Greetings to you in the precious name of our Lord and Savior Jesus Christ.

It gives me great joy to inform you that, by the grace of God, our Pastorate will be celebrating the Harvest Festival on [date] at [time] in [venue/church name]. This is a blessed occasion where we come together as one family of God to offer thanksgiving for His abundant mercies and provisions.

On behalf of our Pastorate Committee, I kindly invite you and your congregation to join us in this celebration. Your presence and support will encourage our members and strengthen the bond of fellowship between our Pastorates. It gives me great joy to inform you that, by the grace of God, our Pastorate will be celebrating the Harvest Festival on [date] at [time] in [venue/church name]. This is a blessed occasion where we come together as one family of God to offer thanksgiving for His abundant mercies and provisions.

On behalf of our Pastorate Committee, I kindly invite you and your congregation to join us in this celebration. Your presence and support will encourage our members and strengthen the bond of fellowship between our Pastorates.

We would be grateful if you could also extend this invitation to your pastor, office bearers, and congregation. Together, let us glorify the Lord of the harvest and make this event a time of joyful thanksgiving and witness.

We would be grateful if you could also extend this invitation to your pastor, office bearers, and congregation. Together, let us glorify the Lord of the harvest and make this event a time of joyful thanksgiving and witness.

Thanking you in anticipation of your kind cooperation and participation.

Yours in His Service,</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 70.50mm;
        width: 41.00mm;
        height: 5.10mm;
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
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">2025/A/01</div>
      </div>
      <div class="text-frame" style="
        left: 170.47mm;
        top: 70.53mm;
        width: 26.83mm;
        height: 5.47mm;
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
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">12-02-2025</div>
      </div>
      <div class="text-frame" style="
        left: 154.00mm;
        top: 70.53mm;
        width: 10.93mm;
        height: 2.87mm;
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
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Date : </div>
      </div>
      <div class="text-frame" style="
        left: 140.33mm;
        top: 36.17mm;
        width: 56.97mm;
        height: 31.57mm;
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
          font-size: 13.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Christ Church Parsonage
14, Zion Church Street,
Samathanapuram
Tenkasi
Ph:75388122218</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 38.42mm;
        width: 72.63mm;
        height: 29.67mm;
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
          font-size: 13.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Rev. T SAMUEL
Pastorate Chairman
Tenkasi North Zion Nagar Pastorate</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 24.42mm;
        width: 184.60mm;
        height: 8.73mm;
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
          font-size: 15.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Tenkasi North Zion Nagar Pastorate</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 17.70mm;
        width: 184.60mm;
        height: 5.47mm;
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
          font-size: 12.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Church of South India - Tirunelveli Diocese</div>
      </div>
      <div class="shape" style="
        left: 183.77mm;
        top: 12.03mm;
        width: 13.53mm;
        height: 22.89mm;
      "></div>
      <div class="shape" style="
        left: 12.70mm;
        top: 12.80mm;
        width: 21.35mm;
        height: 21.35mm;
      "></div>
      <div class="image-frame" style="
        left: 183.77mm;
        top: 12.03mm;
        width: 13.53mm;
        height: 22.89mm;
        overflow: hidden;
      ">
        <img src="D:/Ecclesia/frontend/src/assets/CSI_Tirunelveli_Diocese_Logo.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div class="image-frame" style="
        left: 12.70mm;
        top: 12.80mm;
        width: 21.35mm;
        height: 21.35mm;
        overflow: hidden;
      ">
        <img src="D:/Ecclesia/frontend/src/assets/Church_of_South_India.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="12.70mm" y1="67.92mm" x2="197.30mm" y2="67.92mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
    </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: 'tamil-output.pdf',
    width: '210.00mm',
    height: '297.00mm',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });

  await browser.close();
  console.log('PDF generated successfully!');
}

generateTamilPDF().catch(console.error);