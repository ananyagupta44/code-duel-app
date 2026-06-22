export const generateJSWrapper = (userCode, functionName, input) => {
  const args = Object.values(JSON.parse(input));

  return `
${userCode}

const result = ${functionName}(
${args.map((a) => JSON.stringify(a)).join(",")}
);

console.log(JSON.stringify(result));
`;
};

export const generatePythonWrapper = (userCode, functionName, input) => {
  const args = Object.values(JSON.parse(input));

  const toPythonLiteral = (val) => {
    if (val === null) return "None";
    if (typeof val === "boolean") return val ? "True" : "False";
    if (typeof val === "string") return `"${val}"`;
    if (Array.isArray(val)) return `[${val.map(toPythonLiteral).join(", ")}]`;
    return JSON.stringify(val); // numbers, etc.
  };

  return `
${userCode}

result = ${functionName}(${args.map(toPythonLiteral).join(", ")})
print(result)
`;
};

export const generateCppWrapper = (userCode, functionName, input) => {
  const parsed = JSON.parse(input);
  const args = Object.values(parsed);

  const argDeclarations = args
    .map((arg, i) => {
      if (Array.isArray(arg))
        return `vector<int> arg${i} = {${arg.join(",")}};`;
      if (typeof arg === "string") return `string arg${i} = "${arg}";`;
      if (typeof arg === "boolean")
        return `bool arg${i} = ${arg ? "true" : "false"};`;
      if (typeof arg === "number")
        return Number.isInteger(arg)
          ? `int arg${i} = ${arg};`
          : `double arg${i} = ${arg};`;
      return `auto arg${i} = ${arg};`;
    })
    .join("\n    ");

  const argNames = args.map((_, i) => `arg${i}`).join(", ");

  return `
#include <bits/stdc++.h>
using namespace std;

void printResult(int x) { cout << x; }
void printResult(long long x) { cout << x; }
void printResult(double x) { cout << x; }
void printResult(bool x) { cout << (x ? "true" : "false"); }
void printResult(string x) { cout << x; }
void printResult(vector<int> v) {
    cout << "[";
    for (int i = 0; i < (int)v.size(); i++) {
        cout << v[i];
        if (i < (int)v.size() - 1) cout << ",";
    }
    cout << "]";
}
void printResult(vector<string> v) {
    cout << "[";
    for (int i = 0; i < (int)v.size(); i++) {
        cout << "\\"" << v[i] << "\\"";
        if (i < (int)v.size() - 1) cout << ",";
    }
    cout << "]";
}
void printResult(vector<vector<int>> v) {
    cout << "[";
    for (int i = 0; i < (int)v.size(); i++) {
        cout << "[";
        for (int j = 0; j < (int)v[i].size(); j++) {
            cout << v[i][j];
            if (j < (int)v[i].size() - 1) cout << ",";
        }
        cout << "]";
        if (i < (int)v.size() - 1) cout << ",";
    }
    cout << "]";
}

${userCode}

int main() {
    ${argDeclarations}
    auto result = ${functionName}(${argNames});
    printResult(result);
    return 0;
}
`;
};
