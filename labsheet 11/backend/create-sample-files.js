const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const sampleFiles = [
    {
        name: 'dbms_unit1_notes.pdf',
        title: 'DBMS Unit 1 Notes: Introduction to Database Systems & ER Modeling'
    },
    {
        name: 'os_pyq_2025.pdf',
        title: 'Operating Systems Previous Year Question Paper 2025'
    },
    {
        name: 'dsa_assignment3.pdf',
        title: 'Data Structures & Algorithms - Assignment 3: Trees and Graphs'
    },
    {
        name: 'cn_unit2_notes.pdf',
        title: 'Computer Networks Unit 2: Data Link Layer & Framing Protocols'
    },
    {
        name: 'webtech_reference.pdf',
        title: 'Web Technologies Quick Reference: Modern JavaScript ES6+ & CSS3'
    }
];

function createSimplePdf(title) {
    // Generate a valid minimal PDF file
    const streamContent = `BT /F1 16 Tf 50 720 Td (${title}) Tj ET\nBT /F1 12 Tf 50 680 Td (CampusConnect Student Event & Resource Management Portal) Tj ET\nBT /F1 10 Tf 50 650 Td (This is an official sample study resource uploaded to CampusConnect.) Tj ET`;
    const streamLen = Buffer.byteLength(streamContent);

    return `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamLen} >>
stream
${streamContent}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000059 00000 n 
0000000116 00000 n 
0000000229 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
400
%%EOF`;
}

sampleFiles.forEach(file => {
    const filePath = path.join(uploadDir, file.name);
    fs.writeFileSync(filePath, createSimplePdf(file.title));
    console.log(`Created sample PDF: ${file.name}`);
});

console.log('Sample resource files generated successfully!');
