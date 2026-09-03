async function test() {
  try {
    const res = await fetch('https://app.restuvexo.shop/api/code/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        code: '#include <stdio.h>\nint main() {\n  int n;\n  scanf("%d", &n);\n  if (n % 2 == 0) printf("RESULT: Even (%d)", n);\n  else printf("RESULT: Odd (%d)", n);\n  return 0;\n}',
        input: '42'
      })
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Raw response:', text);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
