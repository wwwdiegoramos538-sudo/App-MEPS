import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '../test-fixtures/sample-formatted.docx');

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:color w:val="0033CC"/><w:sz w:val="28"/><w:b/></w:rPr>
        <w:t>Hello MEPS world</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r>
        <w:rPr><w:color w:val="FF0000"/></w:rPr>
        <w:t>This document keeps colors and formatting.</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Thank you for using our translation platform.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>`;

const zip = new JSZip();
zip.file('[Content_Types].xml', contentTypes);
zip.folder('_rels').file('.rels', rels);
zip.folder('word').file('document.xml', documentXml);

const buffer = await zip.generateAsync({ type: 'nodebuffer' });
await fs.mkdir(path.dirname(outPath), { recursive: true });
await fs.writeFile(outPath, buffer);
console.log('Created', outPath);
