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
      if (Array.isArray(arg)) {
        return `vector<int> arg${i} = {${arg.join(",")}};`;
      }
      if (typeof arg === "string") return `string arg${i} = "${arg}";`;
      if (typeof arg === "boolean")
        return `bool arg${i} = ${arg ? "true" : "false"};`;
      if (typeof arg === "number") {
        return Number.isInteger(arg)
          ? `int arg${i} = ${arg};`
          : `double arg${i} = ${arg};`;
      }
      return `auto arg${i} = ${JSON.stringify(arg)};`;
    })
    .join("\n    ");

  const argNames = args.map((_, i) => `arg${i}`).join(", ");

  return `
#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    ${argDeclarations}
    auto result = ${functionName}(${argNames});

    // print vector
    if (false) {}
    #define PRINT_VEC(T) \\
    else if constexpr (is_same<decltype(result), vector<T>>::value) { \\
        cout << "["; \\
        for (int i = 0; i < (int)result.size(); i++) { \\
            cout << result[i]; \\
            if (i < (int)result.size() - 1) cout << ","; \\
        } \\
        cout << "]"; \\
    }
    PRINT_VEC(int)
    PRINT_VEC(string)
    PRINT_VEC(double)
    else if constexpr (is_same<decltype(result), bool>::value) {
        cout << (result ? "true" : "false");
    }
    else if constexpr (is_same<decltype(result), string>::value) {
        cout << result;
    }
    else {
        cout << result;
    }

    return 0;
}
`;
};
