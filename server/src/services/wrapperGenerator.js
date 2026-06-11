export const generateJSWrapper = (
  userCode,
  functionName,
  input
) => {
  const args = Object.values(
    JSON.parse(input)
  );

  return `
${userCode}

const result = ${functionName}(
${args.map((a) => JSON.stringify(a)).join(",")}
);

console.log(JSON.stringify(result));
`;
};

export const generatePythonWrapper = (
  userCode,
  functionName,
  input
) => {
  const args = Object.values(
    JSON.parse(input)
  );

  return `
${userCode}

result = ${functionName}(
${args.map((a) => JSON.stringify(a)).join(",")}
)

print(result)
`;
};

export const generateCppWrapper = (
  userCode,
  functionName,
  input
) => {
  const parsed = JSON.parse(input);

  const args = Object.values(parsed)
    .map((arg) => {
      if (Array.isArray(arg)) {
        return `vector<int>{${arg.join(",")}}`;
      }

      if (typeof arg === "string") {
        return `"${arg}"`;
      }

      if (typeof arg === "boolean") {
        return arg ? "true" : "false";
      }

      return arg;
    })
    .join(", ");

  return `
#include <bits/stdc++.h>
using namespace std;

${userCode}

int main() {
    auto result = ${functionName}(${args});

    if constexpr (
        std::is_same_v<decltype(result), vector<int>>
    ) {
        cout << "[";

        for (int i = 0; i < result.size(); i++) {
            cout << result[i];

            if (i < result.size() - 1)
                cout << ",";
        }

        cout << "]";
    }

    else if constexpr (
        std::is_same_v<decltype(result), bool>
    ) {
        cout << (result ? "true" : "false");
    }

    else {
        cout << result;
    }

    return 0;
}
`;
};