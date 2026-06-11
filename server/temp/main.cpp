
#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
     unordered_map<int,int> mp;

    for(int i=0;i<nums.size();i++) {
        int c = target - nums[i];

        if(mp.count(c))
            return {mp[c], i};

        mp[nums[i]] = i;
    }

    return {};
}

int main() {
    auto result = twoSum(vector<int>{2,7,11,15}, 9);

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
