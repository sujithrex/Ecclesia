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
        left: 215.50mm;
        top: 187.27mm;
        width: 37.61mm;
        height: 5.84mm;
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
        ">Designation :</div>
      </div>
      <div class="text-frame" style="
        left: 12.94mm;
        top: 187.27mm;
        width: 37.61mm;
        height: 5.84mm;
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
        ">Place :</div>
      </div>
      <div class="text-frame" style="
        left: 215.50mm;
        top: 178.51mm;
        width: 37.61mm;
        height: 5.84mm;
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
        ">Signature :</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 178.51mm;
        width: 37.61mm;
        height: 5.84mm;
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
        ">Date  :</div>
      </div>
      <div class="text-frame" style="
        left: 12.70mm;
        top: 160.44mm;
        width: 271.72mm;
        height: 8.56mm;
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
        left: 255.63mm;
        top: 70.62mm;
        width: 28.35mm;
        height: 13.83mm;
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
        ">அடக்கம் செய்தவரின் கையொப்பம்</div>
      </div>
      <div class="text-frame" style="
        left: 230.72mm;
        top: 68.74mm;
        width: 24.98mm;
        height: 16.10mm;
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
        ">அடக்கம் செய்யப்பட்ட இடம்</div>
      </div>
      <div class="text-frame" style="
        left: 197.43mm;
        top: 68.76mm;
        width: 33.23mm;
        height: 16.10mm;
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
        ">பெற்றோரின் பெயர்</div>
      </div>
      <div class="text-frame" style="
        left: 121.74mm;
        top: 67.24mm;
        width: 21.48mm;
        height: 16.10mm;
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
        ">வயது</div>
      </div>
      <div class="text-frame" style="
        left: 170.55mm;
        top: 69.76mm;
        width: 27.08mm;
        height: 16.10mm;
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
        ">மரணத்தின் காரணம்</div>
      </div>
      <div class="text-frame" style="
        left: 143.22mm;
        top: 68.91mm;
        width: 27.33mm;
        height: 16.10mm;
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
        ">தொழில்</div>
      </div>
      <div class="text-frame" style="
        left: 106.33mm;
        top: 68.84mm;
        width: 13.44mm;
        height: 16.10mm;
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
        ">ஆண் / பெண்</div>
      </div>
      <div class="text-frame" style="
        left: 51.54mm;
        top: 69.38mm;
        width: 22.53mm;
        height: 16.10mm;
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
        ">அடக்கம் பண்ணின தேதி</div>
      </div>
      <div class="text-frame" style="
        left: 75.42mm;
        top: 68.02mm;
        width: 26.70mm;
        height: 16.10mm;
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
        ">மரித்தவரின் பெயர்</div>
      </div>
      <div class="text-frame" style="
        left: 28.02mm;
        top: 68.02mm;
        width: 22.53mm;
        height: 16.10mm;
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
        ">மரித்த தேதி</div>
      </div>
      <div class="text-frame" style="
        left: 13.17mm;
        top: 72.87mm;
        width: 14.85mm;
        height: 7.34mm;
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
        ">நம்பர்</div>
      </div>
      <div class="text-frame" style="
        left: 255.70mm;
        top: 54.86mm;
        width: 28.51mm;
        height: 16.10mm;
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
        left: 230.72mm;
        top: 54.55mm;
        width: 24.67mm;
        height: 16.10mm;
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
        left: 197.43mm;
        top: 54.99mm;
        width: 33.24mm;
        height: 16.10mm;
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
        ">Parent’s Name</div>
      </div>
      <div class="text-frame" style="
        left: 121.74mm;
        top: 55.05mm;
        width: 21.48mm;
        height: 16.10mm;
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
        left: 171.38mm;
        top: 54.99mm;
        width: 26.39mm;
        height: 16.10mm;
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
        left: 144.06mm;
        top: 55.14mm;
        width: 24.98mm;
        height: 16.10mm;
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
        ">Trade/ Profession</div>
      </div>
      <div class="text-frame" style="
        left: 105.60mm;
        top: 53.93mm;
        width: 14.18mm;
        height: 16.10mm;
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
        left: 52.33mm;
        top: 56.13mm;
        width: 19.83mm;
        height: 16.10mm;
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
        left: 75.42mm;
        top: 54.55mm;
        width: 25.55mm;
        height: 16.10mm;
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
        left: 32.60mm;
        top: 54.67mm;
        width: 13.97mm;
        height: 16.10mm;
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
        left: 13.16mm;
        top: 59.22mm;
        width: 14.86mm;
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
          align-items: center;
          font-size: 10.4pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Number</div>
      </div>
      <div class="text-frame" style="
        left: 12.87mm;
        top: 38.51mm;
        width: 271.03mm;
        height: 8.76mm;
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
          font-size: 20.8pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">அடக்கம் பண்ணும் ரிஜிஸ்டர்</div>
      </div>
      <div class="text-frame" style="
        left: 13.17mm;
        top: 30.94mm;
        width: 271.03mm;
        height: 8.76mm;
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
          font-size: 17.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">REGISTER OF BAPTISM OF INFANTS</div>
      </div>
      <div class="text-frame" style="
        left: 13.19mm;
        top: 21.99mm;
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
      <div class="text-frame" style="
        left: 12.87mm;
        top: 13.88mm;
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
        ">Church of South India -  Tirunelveli Diocese</div>
      </div>
      <div class="shape" style="
        left: 12.70mm;
        top: 86.36mm;
        width: 271.72mm;
        height: 68.17mm;
        border: 0.33mm solid #000000;
      "></div>
      <div class="shape" style="
        left: 12.70mm;
        top: 53.22mm;
        width: 271.72mm;
        height: 33.61mm;
        border: 0.33mm solid #000000;
      "></div>
      <div class="shape" style="
        left: 267.04mm;
        top: 12.80mm;
        width: 16.93mm;
        height: 28.65mm;
      "></div>
      <div class="shape" style="
        left: 12.87mm;
        top: 12.70mm;
        width: 26.70mm;
        height: 26.70mm;
      "></div>
      <div class="image-frame" style="
        left: 267.04mm;
        top: 12.80mm;
        width: 16.93mm;
        height: 28.65mm;
        overflow: hidden;
      ">
        <img src="D:/Ecclesia/frontend/src/assets/CSI_Tirunelveli_Diocese_Logo.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <div class="image-frame" style="
        left: 12.87mm;
        top: 12.70mm;
        width: 26.70mm;
        height: 26.70mm;
        overflow: hidden;
      ">
        <img src="D:/Ecclesia/frontend/src/assets/Church_of_South_India.png" style="width: 100%; height: 100%; object-fit: cover;" />
      </div>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="255.40mm" y1="53.36mm" x2="255.40mm" y2="154.43mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="230.84mm" y1="53.22mm" x2="230.84mm" y2="154.29mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="197.60mm" y1="53.18mm" x2="197.60mm" y2="154.25mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="170.86mm" y1="53.18mm" x2="170.86mm" y2="154.25mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="143.05mm" y1="53.46mm" x2="143.05mm" y2="154.25mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="121.57mm" y1="53.46mm" x2="121.57mm" y2="154.53mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="104.14mm" y1="53.30mm" x2="104.14mm" y2="154.37mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="74.24mm" y1="53.22mm" x2="74.24mm" y2="154.29mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="51.03mm" y1="53.22mm" x2="51.03mm" y2="154.29mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="27.99mm" y1="53.22mm" x2="27.99mm" y2="154.46mm" stroke="#000000" stroke-width="0.33mm" />
      </svg>
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