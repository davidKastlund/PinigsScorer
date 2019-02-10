import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CombinationHelperService {

  constructor() { }

  public getAllPossibleCombinationsEvenlyDistributed(stringIds: string[], numberOfRounds: number): string[][] {
    const stringIdCombinations = this.getAllPossibleCombinations(stringIds, 2);
    let matchesEvenlyDiststributed = [];

    const frequensyById = stringIds.reduce((acc, t) => {
      acc[t] = 0;
      return acc;
    }, {});

    for (let i = 0; i < stringIdCombinations.length; i++) {
      const nextMatch = stringIdCombinations
        .filter(m => !matchesEvenlyDiststributed.some(am => am[0] === m[0] && am[1] === m[1]))
        .sort((a, b) => {
          const aPlayedWeight = frequensyById[a[0]] + frequensyById[a[1]];
          const bPlayedWeight = frequensyById[b[0]] + frequensyById[b[1]];
          return aPlayedWeight - bPlayedWeight;
        })[0];

      frequensyById[nextMatch[0]] = frequensyById[nextMatch[0]] + 1;
      frequensyById[nextMatch[1]] = frequensyById[nextMatch[1]] + 1;

      matchesEvenlyDiststributed.push(nextMatch);
    }

    const newLocal = Array.from({ length: numberOfRounds }, (v, k) => k + 1);
    matchesEvenlyDiststributed = newLocal.reduce((acc) => {
      return acc.concat(matchesEvenlyDiststributed);
    }, []);

    return matchesEvenlyDiststributed;
  }

  private getAllPossibleCombinations(arr: string[], combinationSize: number): string[][] {
    const data: string[] = new Array<string>(combinationSize);
    const resultArr: string[][] = [];
    this.combinationUtil(arr, data, 0, arr.length - 1, 0, combinationSize, resultArr);

    return resultArr;
  }

  private combinationUtil(arr: string[], data: string[],
    start: number, end: number,
    index: number, combinationSize: number, resultArr: string[][]) {
    // Current combination is
    // ready to be printed,
    // print it
    if (index === combinationSize) {
      resultArr.push(Object.assign([], data));
      return;
    }

    // replace index with all
    // possible elements. The
    // condition "end-i+1 >=
    // r-index" makes sure that
    // including one element
    // at index will make a
    // combination with remaining
    // elements at remaining positions
    for (let i = start; i <= end && end - i + 1 >= combinationSize - index; i++) {
      data[index] = arr[i];
      this.combinationUtil(arr, data, i + 1, end, index + 1, combinationSize, resultArr);
    }
  }

}
