import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CombinationHelperService {

  constructor() { }

  public getCombinations(arr: string[], combinationSize: number): string[][] {
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
