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

  const detectType = (arg) => {
    if (Array.isArray(arg)) {
      if (Array.isArray(arg[0])) {
        // 2D array
        if (typeof arg[0][0] === "string" && arg[0][0].length === 1)
          return "vector<vector<char>>";
        return "vector<vector<int>>";
      }
      if (typeof arg[0] === "string" && arg[0].length === 1)
        return "vector<char>";
      if (typeof arg[0] === "string") return "vector<string>";
      return "vector<int>";
    }
    if (typeof arg === "string" && arg.length === 1) return "char";
    if (typeof arg === "string") return "string";
    if (typeof arg === "boolean") return "bool";
    if (typeof arg === "number")
      return Number.isInteger(arg) ? "int" : "double";
    return "auto";
  };

  const toLiteral = (arg, type) => {
    if (type === "vector<vector<char>>") {
      const rows = arg.map((row) => `{'${row.join("','")}'}`).join(",");
      return `{${rows}}`;
    }
    if (type === "vector<vector<int>>") {
      const rows = arg.map((row) => `{${row.join(",")}}`).join(",");
      return `{${rows}}`;
    }
    if (type === "vector<char>") return `{'${arg.join("','")}'}`;
    if (type === "vector<string>") return `{"${arg.join('","')}"}`;
    if (type === "vector<int>") return `{${arg.join(",")}}`;
    if (type === "char") return `'${arg}'`;
    if (type === "string") return `"${arg}"`;
    if (type === "bool") return arg ? "true" : "false";
    return arg;
  };

  const argDeclarations = args
    .map((arg, i) => {
      const type = detectType(arg);
      return `${type} arg${i} = ${toLiteral(arg, type)};`;
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
void printResult(char x) { cout << x; }
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
    Solution sol;
    auto result = sol.${functionName}(${argNames});
    printResult(result);
    return 0;
}
`;
};
