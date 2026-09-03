async function test() {
  const res = await fetch('https://app.restuvexo.shop/api/code/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: 'c',
      code: '#include <stdio.h>\nint main() {\n    printf("Hello from Live Docker Sandbox!\\n");\n    return 0;\n}',
      input: '',
    }),
  });
  const data = await res.json();
  console.log('API STATUS:', res.status);
  console.log('API RESULT:', data);
}
test();
