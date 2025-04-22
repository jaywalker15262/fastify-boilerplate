import makeLoginUser from './login/login.handler';
import { actionCreatorFactory } from '@/shared/cqrs/action-creator';

export const authActionCreator = actionCreatorFactory('auth');

declare global {
  export interface Dependencies {
    // Add future dependencies here (e.g., jwtService, authRepository)
  }
}

export default function authModule(deps: Dependencies) {
  return {
    commands: [makeLoginUser(deps)],
    // Add queries or events later as needed
  };
}