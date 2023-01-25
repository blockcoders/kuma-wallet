import { useEffect } from "react";
import Extension from "../utils/Extension";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { mnemonicGenerate } from "@polkadot/util-crypto";

interface InitialState {
  extensionController: Extension | null;
  isInit: boolean;
}

const initialState: InitialState = {
  extensionController: null,
  isInit: true,
};

const AuthContext = createContext(
  {} as {
    state: InitialState;
    createAccount: (newAccount: any) => Promise<boolean>;
  }
);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    case "init": {
      return {
        ...action.payload,
        isInit: false,
      };
    }
    default:
      return state;
  }
};

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      const extensionController = new Extension();

      dispatch({
        type: "init",
        payload: {
          extensionController,
        },
      });
    })();
  }, []);

  const createAccount = async ({ name, password, accountType }: any) => {
    try {
      console.log("createAccout", accountType);
      const seed = mnemonicGenerate(12);
      state.extensionController!.accountType = accountType;
      await state.extensionController?.signUp({ password, name, seed });
      return true;
    } catch (error) {
      console.log(error as string);
      return false;
    }
  };
  return (
    <AuthContext.Provider
      value={{
        state,
        createAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
