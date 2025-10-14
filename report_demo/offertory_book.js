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
        left: 133.19mm;
        top: 27.67mm;
        width: 15.40mm;
        height: 2.76mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">ஊழியர்</div>
      </div>
      <div class="text-frame" style="
        left: 117.79mm;
        top: 27.49mm;
        width: 15.40mm;
        height: 2.76mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">சபை</div>
      </div>
      <div class="text-frame" style="
        left: 117.61mm;
        top: 23.67mm;
        width: 31.15mm;
        height: 3.25mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">சங்க காணிக்கை</div>
      </div>
      <div class="text-frame" style="
        left: 256.38mm;
        top: 24.59mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">மொத்தம்</div>
      </div>
      <div class="text-frame" style="
        left: 271.60mm;
        top: 24.59mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">கையெழுத்து</div>
      </div>
      <div class="text-frame" style="
        left: 210.36mm;
        top: 24.77mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">இந்திய மிசனரி சங்கம்</div>
      </div>
      <div class="text-frame" style="
        left: 194.61mm;
        top: 24.70mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">பாலியர் சங்கம்</div>
      </div>
      <div class="text-frame" style="
        left: 179.39mm;
        top: 24.42mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">ஞானஸ்நானம்</div>
      </div>
      <div class="text-frame" style="
        left: 163.99mm;
        top: 24.27mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">கல்யாணம் மற்றும் பீஸ்</div>
      </div>
      <div class="text-frame" style="
        left: 148.76mm;
        top: 24.52mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">அறுப்பின் பண்டிகை</div>
      </div>
      <div class="text-frame" style="
        left: 102.57mm;
        top: 24.77mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">பலவித காணிக்கை</div>
      </div>
      <div class="text-frame" style="
        left: 87.17mm;
        top: 24.59mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">ஸ்தோத்திர காணிக்கை</div>
      </div>
      <div class="text-frame" style="
        left: 71.42mm;
        top: 24.77mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">பரி. நற்கருணை</div>
      </div>
      <div class="text-frame" style="
        left: 56.02mm;
        top: 24.70mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">கோயில் காணிக்கை</div>
      </div>
      <div class="text-frame" style="
        left: 40.62mm;
        top: 24.77mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">வாடகை</div>
      </div>
      <div class="text-frame" style="
        left: 25.22mm;
        top: 24.59mm;
        width: 15.40mm;
        height: 6.15mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">நில வருமானம்</div>
      </div>
      <div class="text-frame" style="
        left: 256.20mm;
        top: 31.00mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 210.01mm;
        top: 31.35mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 194.78mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 179.21mm;
        top: 31.47mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 163.81mm;
        top: 31.47mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 148.94mm;
        top: 31.00mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 133.01mm;
        top: 31.00mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 117.97mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 102.22mm;
        top: 31.35mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 86.99mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 71.42mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 56.55mm;
        top: 31.47mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 40.97mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 25.58mm;
        top: 31.17mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2000</div>
      </div>
      <div class="text-frame" style="
        left: 10.18mm;
        top: 31.47mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">25-05-2025</div>
      </div>
      <div class="text-frame" style="
        left: 10.18mm;
        top: 25.02mm;
        width: 15.05mm;
        height: 5.90mm;
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
          font-size: 7.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">தேதி</div>
      </div>
      <div class="text-frame" style="
        left: 231.20mm;
        top: 16.83mm;
        width: 58.20mm;
        height: 4.77mm;
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
        ">வருடம் : 2025</div>
      </div>
      <div class="text-frame" style="
        left: 173.00mm;
        top: 16.83mm;
        width: 58.20mm;
        height: 4.77mm;
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
        ">மாதம் : OCTOBER</div>
      </div>
      <div class="text-frame" style="
        left: 97.30mm;
        top: 16.83mm;
        width: 71.42mm;
        height: 5.60mm;
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
        ">சபை : சபை பெயர் </div>
      </div>
      <div class="text-frame" style="
        left: 10.18mm;
        top: 16.83mm;
        width: 84.22mm;
        height: 5.60mm;
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
        ">சேகரம் : சேகரம் பெயர் </div>
      </div>
      <div class="text-frame" style="
        left: 10.18mm;
        top: 7.75mm;
        width: 276.82mm;
        height: 5.60mm;
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
        ">சபை காணிக்கை புத்தகம்</div>
      </div>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="117.79mm" y1="27.17mm" x2="148.41mm" y2="27.17mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="9.82mm" y1="200.18mm" x2="287.35mm" y2="200.18mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.00mm" y1="37.38mm" x2="287.53mm" y2="37.38mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="9.82mm" y1="31.17mm" x2="287.35mm" y2="31.17mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="9.82mm" y1="23.84mm" x2="287.35mm" y2="23.84mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="271.78mm" y1="23.83mm" x2="271.78mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="287.18mm" y1="23.83mm" x2="287.18mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="256.38mm" y1="23.83mm" x2="256.38mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="240.98mm" y1="23.83mm" x2="240.98mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="225.58mm" y1="23.83mm" x2="225.58mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="210.18mm" y1="23.83mm" x2="210.18mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="194.78mm" y1="23.83mm" x2="194.78mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="179.39mm" y1="23.83mm" x2="179.39mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="163.99mm" y1="23.83mm" x2="163.99mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="148.59mm" y1="23.83mm" x2="148.59mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="133.19mm" y1="27.10mm" x2="133.19mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="117.79mm" y1="23.83mm" x2="117.79mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="102.39mm" y1="23.83mm" x2="102.39mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="86.99mm" y1="23.83mm" x2="86.99mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="71.59mm" y1="23.83mm" x2="71.59mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="56.20mm" y1="23.83mm" x2="56.20mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="40.80mm" y1="23.83mm" x2="40.80mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="25.40mm" y1="23.83mm" x2="25.40mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.00mm" y1="23.83mm" x2="10.00mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
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