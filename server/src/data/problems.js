const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",

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
    slug: "palindrome-number",

    functionName: "isPalindrome",

    difficulty: "easy",

    topic: "math",

    description:
      "Given an integer x, return true if x is a palindrome, otherwise return false.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          x: 121,
        }),
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          x: -121,
        }),
        expectedOutput: "false",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function isPalindrome(x) {

}`,
      python: `def isPalindrome(x):
    pass`,
      cpp: `bool isPalindrome(int x) {

}`,
    },
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",

    functionName: "isValid",

    difficulty: "easy",

    topic: "stack",

    description: "Determine if the input string containing brackets is valid.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          s: "()[]{}",
        }),
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          s: "(]",
        }),
        expectedOutput: "false",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function isValid(s) {

}`,
      python: `def isValid(s):
    pass`,
      cpp: `bool isValid(string s) {

}`,
    },
  },
  {
    title: "Maximum Element",
    slug: "maximum-element",

    functionName: "findMax",

    difficulty: "easy",

    topic: "array",

    description: "Return the maximum element from the array.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [1, 5, 3, 9, 2],
        }),
        expectedOutput: "9",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [-1, -5, -2],
        }),
        expectedOutput: "-1",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function findMax(nums) {

}`,
      python: `def findMax(nums):
    pass`,
      cpp: `int findMax(vector<int>& nums) {

}`,
    },
  },
  {
    title: "Reverse String",
    slug: "reverse-string",

    functionName: "reverseString",

    difficulty: "easy",

    topic: "string",

    description: "Return the reverse of the given string.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          s: "hello",
        }),
        expectedOutput: '"olleh"',
        isHidden: false,
      },
      {
        input: JSON.stringify({
          s: "codeduel",
        }),
        expectedOutput: '"leudedoc"',
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function reverseString(s) {

}`,
      python: `def reverseString(s):
    pass`,
      cpp: `string reverseString(string s) {

}`,
    },
  },

  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",

    functionName: "containsDuplicate",

    difficulty: "easy",

    topic: "hash-map",

    description:
      "Given an integer array nums, return true if any value appears at least twice in the array.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [1, 2, 3, 1],
        }),
        expectedOutput: "true",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [1, 2, 3, 4],
        }),
        expectedOutput: "false",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [1, 1, 1, 3, 3, 4, 3, 2, 4, 2],
        }),
        expectedOutput: "true",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function containsDuplicate(nums) {

}`,
      python: `def containsDuplicate(nums):
    pass`,
      cpp: `bool containsDuplicate(vector<int>& nums) {

}`,
    },
  },

  {
    title: "Fizz Buzz",
    slug: "fizz-buzz",

    functionName: "fizzBuzz",

    difficulty: "easy",

    topic: "math",

    description:
      "Return an array from 1 to n. Multiples of 3 become 'Fizz', multiples of 5 become 'Buzz', and multiples of both become 'FizzBuzz'.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          n: 5,
        }),
        expectedOutput: '["1","2","Fizz","4","Buzz"]',
        isHidden: false,
      },
      {
        input: JSON.stringify({
          n: 15,
        }),
        expectedOutput:
          '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function fizzBuzz(n) {

}`,
      python: `def fizzBuzz(n):
    pass`,
      cpp: `vector<string> fizzBuzz(int n) {

}`,
    },
  },

  {
    title: "Binary Search",
    slug: "binary-search",

    functionName: "search",

    difficulty: "medium",

    topic: "binary-search",

    description:
      "Given a sorted array and a target, return its index. Return -1 if not found.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [-1, 0, 3, 5, 9, 12],
          target: 9,
        }),
        expectedOutput: "4",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [-1, 0, 3, 5, 9, 12],
          target: 2,
        }),
        expectedOutput: "-1",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [5],
          target: 5,
        }),
        expectedOutput: "0",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [1, 2, 3, 4, 5],
          target: 4,
        }),
        expectedOutput: "3",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function search(nums, target) {

}`,
      python: `def search(nums, target):
    pass`,
      cpp: `int search(vector<int>& nums, int target) {

}`,
    },
  },

  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",

    functionName: "productExceptSelf",

    difficulty: "medium",

    topic: "array",

    description:
      "Return an array where each element is the product of all elements except itself.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [1, 2, 3, 4],
        }),
        expectedOutput: "[24,12,8,6]",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [-1, 1, 0, -3, 3],
        }),
        expectedOutput: "[0,0,9,0,0]",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [2, 3, 4, 5],
        }),
        expectedOutput: "[60,40,30,24]",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [1, 1, 1, 1],
        }),
        expectedOutput: "[1,1,1,1]",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function productExceptSelf(nums) {

}`,
      python: `def productExceptSelf(nums):
    pass`,
      cpp: `vector<int> productExceptSelf(vector<int>& nums) {

}`,
    },
  },

  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",

    functionName: "lengthOfLongestSubstring",

    difficulty: "medium",

    topic: "string",

    description:
      "Given a string s, find the length of the longest substring without repeating characters.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          s: "abcabcbb",
        }),
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          s: "bbbbb",
        }),
        expectedOutput: "1",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          s: "pwwkew",
        }),
        expectedOutput: "3",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          s: "",
        }),
        expectedOutput: "0",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          s: "dvdf",
        }),
        expectedOutput: "3",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {

}`,
      python: `def lengthOfLongestSubstring(s):
    pass`,
      cpp: `int lengthOfLongestSubstring(string s) {

}`,
    },
  },

  {
    title: "Group Anagrams",
    slug: "group-anagrams",

    functionName: "groupAnagrams",

    difficulty: "medium",

    topic: "hash-map",

    description: "Group strings that are anagrams of each other.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          strs: ["eat", "tea", "tan", "ate", "nat", "bat"],
        }),
        expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
        isHidden: false,
      },
      {
        input: JSON.stringify({
          strs: [""],
        }),
        expectedOutput: '[[""]]',
        isHidden: true,
      },
      {
        input: JSON.stringify({
          strs: ["a"],
        }),
        expectedOutput: '[["a"]]',
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function groupAnagrams(strs) {

}`,
      python: `def groupAnagrams(strs):
    pass`,
      cpp: `vector<vector<string>> groupAnagrams(vector<string>& strs) {

}`,
    },
  },

  {
    title: "Top K Frequent Elements",
    slug: "top-k-frequent-elements",

    functionName: "topKFrequent",

    difficulty: "medium",

    topic: "heap",

    description: "Return the k most frequent elements.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          nums: [1, 1, 1, 2, 2, 3],
          k: 2,
        }),
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums: [1],
          k: 1,
        }),
        expectedOutput: "[1]",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums: [4, 4, 4, 6, 6, 2],
          k: 1,
        }),
        expectedOutput: "[4]",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function topKFrequent(nums, k) {

}`,
      python: `def topKFrequent(nums, k):
    pass`,
      cpp: `vector<int> topKFrequent(vector<int>& nums, int k) {

}`,
    },
  },

  {
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",

    functionName: "maxDepth",

    difficulty: "easy",

    topic: "tree",

    description: "Return the maximum depth of a binary tree.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          root: [3, 9, 20, null, null, 15, 7],
        }),
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          root: [1, null, 2],
        }),
        expectedOutput: "2",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function maxDepth(root) {

}`,
      python: `def maxDepth(root):
    pass`,
      cpp: `int maxDepth(TreeNode* root) {

}`,
    },
  },

  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",

    functionName: "maxProfit",

    difficulty: "easy",

    topic: "greedy",

    description: "Find the maximum profit from one stock transaction.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          prices: [7, 1, 5, 3, 6, 4],
        }),
        expectedOutput: "5",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          prices: [7, 6, 4, 3, 1],
        }),
        expectedOutput: "0",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          prices: [2, 4, 1],
        }),
        expectedOutput: "2",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function maxProfit(prices) {

}`,
      python: `def maxProfit(prices):
    pass`,
      cpp: `int maxProfit(vector<int>& prices) {

}`,
    },
  },

  {
    title: "Number of Islands",
    slug: "number-of-islands",

    functionName: "numIslands",

    difficulty: "medium",

    topic: "graph",

    description: "Count the number of islands in a 2D grid.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          grid: [
            ["1", "1", "1", "1", "0"],
            ["1", "1", "0", "1", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "0", "0", "0"],
          ],
        }),
        expectedOutput: "1",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          grid: [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"],
          ],
        }),
        expectedOutput: "3",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function numIslands(grid) {

}`,
      python: `def numIslands(grid):
    pass`,
      cpp: `int numIslands(vector<vector<char>>& grid) {

}`,
    },
  },

  {
    title: "Coin Change",
    slug: "coin-change",

    functionName: "coinChange",

    difficulty: "medium",

    topic: "dp",

    description: "Return the fewest number of coins needed to make the amount.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          coins: [1, 2, 5],
          amount: 11,
        }),
        expectedOutput: "3",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          coins: [2],
          amount: 3,
        }),
        expectedOutput: "-1",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          coins: [1],
          amount: 0,
        }),
        expectedOutput: "0",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function coinChange(coins, amount) {

}`,
      python: `def coinChange(coins, amount):
    pass`,
      cpp: `int coinChange(vector<int>& coins, int amount) {

}`,
    },
  },

  {
    title: "Merge Two Sorted Lists",
    slug: "merge-two-sorted-lists",

    functionName: "mergeTwoLists",

    difficulty: "easy",

    topic: "linked-list",

    description: "Merge two sorted linked lists.",

    timeLimit: 1,

    testCases: [
      {
        input: JSON.stringify({
          list1: [1, 2, 4],
          list2: [1, 3, 4],
        }),
        expectedOutput: "[1,1,2,3,4,4]",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          list1: [],
          list2: [],
        }),
        expectedOutput: "[]",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {

}`,
      python: `def mergeTwoLists(list1, list2):
    pass`,
      cpp: `ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {

}`,
    },
  },

  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",

    functionName: "trap",

    difficulty: "hard",

    topic: "array",

    description: "Compute how much rain water can be trapped.",

    timeLimit: 2,

    testCases: [
      {
        input: JSON.stringify({
          height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1],
        }),
        expectedOutput: "6",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          height: [4, 2, 0, 3, 2, 5],
        }),
        expectedOutput: "9",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          height: [1, 0, 2],
        }),
        expectedOutput: "1",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function trap(height) {

}`,
      python: `def trap(height):
    pass`,
      cpp: `int trap(vector<int>& height) {

}`,
    },
  },

  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",

    functionName: "findMedianSortedArrays",

    difficulty: "hard",

    topic: "binary-search",

    description: "Find the median of two sorted arrays.",

    timeLimit: 2,

    testCases: [
      {
        input: JSON.stringify({
          nums1: [1, 3],
          nums2: [2],
        }),
        expectedOutput: "2",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          nums1: [1, 2],
          nums2: [3, 4],
        }),
        expectedOutput: "2.5",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          nums1: [],
          nums2: [1],
        }),
        expectedOutput: "1",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {

}`,
      python: `def findMedianSortedArrays(nums1, nums2):
    pass`,
      cpp: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {

}`,
    },
  },

  {
    title: "Word Ladder",
    slug: "word-ladder",

    functionName: "ladderLength",

    difficulty: "hard",

    topic: "graph",

    description: "Return the length of the shortest transformation sequence.",

    timeLimit: 2,

    testCases: [
      {
        input: JSON.stringify({
          beginWord: "hit",
          endWord: "cog",
          wordList: ["hot", "dot", "dog", "lot", "log", "cog"],
        }),
        expectedOutput: "5",
        isHidden: false,
      },
      {
        input: JSON.stringify({
          beginWord: "hit",
          endWord: "cog",
          wordList: ["hot", "dot", "dog", "lot", "log"],
        }),
        expectedOutput: "0",
        isHidden: true,
      },
      {
        input: JSON.stringify({
          beginWord: "a",
          endWord: "c",
          wordList: ["a", "b", "c"],
        }),
        expectedOutput: "2",
        isHidden: true,
      },
    ],

    starterCode: {
      javascript: `function ladderLength(beginWord, endWord, wordList) {

}`,
      python: `def ladderLength(beginWord, endWord, wordList):
    pass`,
      cpp: `int ladderLength(string beginWord, string endWord, vector<string>& wordList) {

}`,
    },
  },
];

export default problems;
