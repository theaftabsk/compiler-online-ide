async function testMultiInput() {
  const code = `
#include <stdio.h>
int main() {
    int id;
    char name[50];
    int age;
    printf("Reading ID...\\n");
    scanf("%d", &id);
    printf("Reading Name...\\n");
    scanf("%s", name);
    printf("Reading Age...\\n");
    scanf("%d", &age);
    printf("SUCCESS: Student ID=%d, Name=%s, Age=%d\\n", id, name, age);
    return 0;
}
`;
  const res = await fetch('https://app.restuvexo.shop/api/code/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language: 'c',
      code: code,
      input: '101\nAftab\n21'
    }),
  });
  const data = await res.json();
  console.log('API STATUS:', res.status);
  console.log('API RESULT:', data);
}
testMultiInput();
