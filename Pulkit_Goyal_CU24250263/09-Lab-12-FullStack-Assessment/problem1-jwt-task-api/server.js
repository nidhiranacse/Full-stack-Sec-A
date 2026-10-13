const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✓ Lab 12 Task Auth Server running on port ${PORT}`);
  console.log(`  Student: Pulkit Goyal (CU24250263 | Roll 40 | Sec A)`);
});
