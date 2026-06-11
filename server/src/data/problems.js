const problems = [
  {
    title: "Two Sum",

    functionName: "twoSum",

    difficulty: "easy",

    topic: "array",

    description:
      "Given an array of integers nums and an integer target, return the indices of two numbers that add up to target.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [2, 7, 11, 15],
          target: 9,
        }),
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [3, 2, 4],
          target: 6,
        }),
        expectedOutput: "[1,2]",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function twoSum(nums, target) {

}`,
      python: `def twoSum(nums, target):
    pass`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {

}`,
    },
  },
  {
  title: "Palindrome Number",

  functionName: "isPalindrome",

  difficulty: "easy",

  topic: "math",

  description:
    "Given an integer x, return true if x is a palindrome, otherwise return false.",

  timeLimit: 1,

  testCases: [
    {
      input: JSON.stringify({
        x: 121
      }),
      expectedOutput: "true",
      isHidden: false
    },
    {
      input: JSON.stringify({
        x: -121
      }),
      expectedOutput: "false",
      isHidden: true
    }
  ],

  starterCode: {
    javascript: `function isPalindrome(x) {

}`,
    python: `def isPalindrome(x):
    pass`,
    cpp: `bool isPalindrome(int x) {

}`
  }
},{
  title: "Valid Parentheses",

  functionName: "isValid",

  difficulty: "easy",

  topic: "stack",

  description:
    "Determine if the input string containing brackets is valid.",

  timeLimit: 1,

  testCases: [
    {
      input: JSON.stringify({
        s: "()[]{}"
      }),
      expectedOutput: "true",
      isHidden: false
    },
    {
      input: JSON.stringify({
        s: "(]"
      }),
      expectedOutput: "false",
      isHidden: true
    }
  ],

  starterCode: {
    javascript: `function isValid(s) {

}`,
    python: `def isValid(s):
    pass`,
    cpp: `bool isValid(string s) {

}`
  }
},
{
  title: "Maximum Element",

  functionName: "findMax",

  difficulty: "easy",

  topic: "array",

  description:
    "Return the maximum element from the array.",

  timeLimit: 1,

  testCases: [
    {
      input: JSON.stringify({
        nums: [1,5,3,9,2]
      }),
      expectedOutput: "9",
      isHidden: false
    },
    {
      input: JSON.stringify({
        nums: [-1,-5,-2]
      }),
      expectedOutput: "-1",
      isHidden: true
    }
  ],

  starterCode: {
    javascript: `function findMax(nums) {

}`,
    python: `def findMax(nums):
    pass`,
    cpp: `int findMax(vector<int>& nums) {

}`
  }
},
{
  title: "Reverse String",

  functionName: "reverseString",

  difficulty: "easy",

  topic: "string",

  description:
    "Return the reverse of the given string.",

  timeLimit: 1,

  testCases: [
    {
      input: JSON.stringify({
        s: "hello"
      }),
      expectedOutput: "\"olleh\"",
      isHidden: false
    },
    {
      input: JSON.stringify({
        s: "codeduel"
      }),
      expectedOutput: "\"leudedoc\"",
      isHidden: true
    }
  ],

  starterCode: {
    javascript: `function reverseString(s) {

}`,
    python: `def reverseString(s):
    pass`,
    cpp: `string reverseString(string s) {

}`
  }
}
];

export default problems;
