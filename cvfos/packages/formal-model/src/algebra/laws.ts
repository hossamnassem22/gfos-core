import { EventAlgebraic } from './types';

export class AlgebraLaws {
  static verifyLaws<S, E>(algebra: EventAlgebraic<S, E>, e1: E, e2: E, e3: E): boolean {
    // 1. التجميع (Associativity): (a + b) + c == a + (b + c)
    const left = algebra.compose(algebra.compose(e1, e2), e3);
    const right = algebra.compose(e1, algebra.compose(e2, e3));
    
    // 2. الهوية (Identity): a + identity == a
    const id = algebra.identity();
    const identityLaw = algebra.compose(e1, id) === e1;

    return (left === right) && identityLaw;
  }
}
