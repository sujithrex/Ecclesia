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
        left: 269.22mm;
        top: 21.84mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Dio. Off</div>
      </div>
      <div class="text-frame" style="
        left: 130.82mm;
        top: 21.93mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Dio. Off</div>
      </div>
      <div class="text-frame" style="
        left: 251.72mm;
        top: 21.81mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Bank</div>
      </div>
      <div class="text-frame" style="
        left: 113.32mm;
        top: 21.90mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Bank</div>
      </div>
      <div class="text-frame" style="
        left: 234.40mm;
        top: 21.66mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Cash</div>
      </div>
      <div class="text-frame" style="
        left: 96.00mm;
        top: 21.75mm;
        width: 17.15mm;
        height: 6.25mm;
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
        ">Cash</div>
      </div>
      <div class="text-frame" style="
        left: 165.04mm;
        top: 22.06mm;
        width: 61.00mm;
        height: 5.67mm;
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
        ">Particulars</div>
      </div>
      <div class="text-frame" style="
        left: 130.82mm;
        top: 28.15mm;
        width: 16.97mm;
        height: 4.90mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">1785250</div>
      </div>
      <div class="text-frame" style="
        left: 113.15mm;
        top: 27.74mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">140245</div>
      </div>
      <div class="text-frame" style="
        left: 95.85mm;
        top: 66.74mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">100</div>
      </div>
      <div class="text-frame" style="
        left: 95.65mm;
        top: 46.91mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">100</div>
      </div>
      <div class="text-frame" style="
        left: 95.85mm;
        top: 59.57mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">100</div>
      </div>
      <div class="text-frame" style="
        left: 95.65mm;
        top: 39.75mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">100</div>
      </div>
      <div class="text-frame" style="
        left: 95.65mm;
        top: 27.74mm;
        width: 17.50mm;
        height: 5.31mm;
      ">
        <div class="text-content" style="
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding: 0.00mm 0.00mm 0.00mm 0.00mm;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: right;
        ">17109</div>
      </div>
      <div class="text-frame" style="
        left: 10.35mm;
        top: 46.66mm;
        width: 16.29mm;
        height: 5.75mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">03-07-25</div>
      </div>
      <div class="text-frame" style="
        left: 10.35mm;
        top: 39.50mm;
        width: 16.29mm;
        height: 5.75mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">02-07-25</div>
      </div>
      <div class="text-frame" style="
        left: 88.00mm;
        top: 66.22mm;
        width: 7.65mm;
        height: 5.86mm;
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
          font-size: 10.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">CO</div>
      </div>
      <div class="text-frame" style="
        left: 88.00mm;
        top: 46.55mm;
        width: 7.65mm;
        height: 5.86mm;
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
          font-size: 10.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2452</div>
      </div>
      <div class="text-frame" style="
        left: 88.00mm;
        top: 59.06mm;
        width: 7.65mm;
        height: 5.86mm;
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
          font-size: 10.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">CO</div>
      </div>
      <div class="text-frame" style="
        left: 88.00mm;
        top: 39.39mm;
        width: 7.65mm;
        height: 5.86mm;
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
          font-size: 10.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">2451</div>
      </div>
      <div class="text-frame" style="
        left: 27.00mm;
        top: 66.24mm;
        width: 60.65mm;
        height: 5.85mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Name of the Church 2</div>
      </div>
      <div class="text-frame" style="
        left: 27.00mm;
        top: 46.56mm;
        width: 60.65mm;
        height: 5.85mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Name of the Giver</div>
      </div>
      <div class="text-frame" style="
        left: 27.00mm;
        top: 59.07mm;
        width: 60.65mm;
        height: 5.85mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Name of the Church 1 </div>
      </div>
      <div class="text-frame" style="
        left: 27.00mm;
        top: 39.40mm;
        width: 60.65mm;
        height: 5.85mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Name of the Giver</div>
      </div>
      <div class="text-frame" style="
        left: 27.26mm;
        top: 53.75mm;
        width: 28.49mm;
        height: 5.50mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Church Offertory</div>
      </div>
      <div class="text-frame" style="
        left: 27.26mm;
        top: 34.08mm;
        width: 14.04mm;
        height: 5.67mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Recipts</div>
      </div>
      <div class="text-frame" style="
        left: 27.00mm;
        top: 28.18mm;
        width: 60.48mm;
        height: 5.67mm;
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
          font-size: 11.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Pastorate Opening Balance</div>
      </div>
      <div class="text-frame" style="
        left: 26.65mm;
        top: 22.15mm;
        width: 61.00mm;
        height: 5.67mm;
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
        ">Particulars</div>
      </div>
      <div class="text-frame" style="
        left: 226.56mm;
        top: 22.06mm;
        width: 7.48mm;
        height: 5.67mm;
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
          font-size: 9.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">R.No</div>
      </div>
      <div class="text-frame" style="
        left: 88.16mm;
        top: 22.15mm;
        width: 7.48mm;
        height: 5.67mm;
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
          font-size: 9.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">R.No</div>
      </div>
      <div class="text-frame" style="
        left: 148.75mm;
        top: 21.89mm;
        width: 16.29mm;
        height: 5.85mm;
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
        ">Date</div>
      </div>
      <div class="text-frame" style="
        left: 10.35mm;
        top: 21.97mm;
        width: 16.29mm;
        height: 5.85mm;
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
        ">Date</div>
      </div>
      <div class="text-frame" style="
        left: 78.00mm;
        top: 15.87mm;
        width: 52.92mm;
        height: 4.32mm;
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
          font-size: 14.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        "> July, 2025</div>
      </div>
      <div class="text-frame" style="
        left: 223.25mm;
        top: 15.87mm;
        width: 63.75mm;
        height: 5.88mm;
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
        ">Pastorate Name</div>
      </div>
      <div class="text-frame" style="
        left: 192.75mm;
        top: 16.00mm;
        width: 30.50mm;
        height: 5.75mm;
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
          font-size: 14.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Pastorate : </div>
      </div>
      <div class="text-frame" style="
        left: 10.00mm;
        top: 15.87mm;
        width: 70.70mm;
        height: 4.32mm;
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
          font-size: 14.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: left;
        ">Pastorate Rough Cash Book of</div>
      </div>
      <div class="text-frame" style="
        left: 10.00mm;
        top: 10.00mm;
        width: 277.00mm;
        height: 6.00mm;
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
          font-size: 14.0pt;
          font-family: 'Vijaya';
          color: #000000;
          text-align: center;
        ">Chruch Name - Diocese Name</div>
      </div>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.00mm" y1="199.82mm" x2="287.00mm" y2="199.82mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.00mm" y1="28.00mm" x2="287.00mm" y2="28.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="269.32mm" y1="21.78mm" x2="269.32mm" y2="199.92mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="130.82mm" y1="21.93mm" x2="130.82mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="251.84mm" y1="21.85mm" x2="251.84mm" y2="199.88mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="113.32mm" y1="21.93mm" x2="113.32mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="234.34mm" y1="21.85mm" x2="234.34mm" y2="199.88mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="95.82mm" y1="21.93mm" x2="95.82mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="226.34mm" y1="21.85mm" x2="226.34mm" y2="199.88mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="87.82mm" y1="21.93mm" x2="87.82mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="165.32mm" y1="21.93mm" x2="165.32mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.18mm" y1="21.75mm" x2="10.18mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="26.82mm" y1="21.57mm" x2="26.82mm" y2="199.82mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="286.82mm" y1="21.93mm" x2="286.82mm" y2="200.00mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="148.53mm" y1="21.65mm" x2="148.53mm" y2="199.72mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="148.07mm" y1="21.57mm" x2="148.07mm" y2="199.65mm" stroke="#000000" stroke-width="0.35mm" />
      </svg>
      <svg class="line" style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; pointer-events: none;">
        <line x1="10.00mm" y1="21.75mm" x2="287.00mm" y2="21.75mm" stroke="#000000" stroke-width="0.35mm" />
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