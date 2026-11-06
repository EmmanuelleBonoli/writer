import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Android n'émet pas les événements "Will" : seuls les "Did" y sont disponibles.
const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/** Indique si le clavier logiciel est ouvert. */
export function useKeyboardVisible(): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(SHOW_EVENT, () => setVisible(true));
    const hideSubscription = Keyboard.addListener(HIDE_EVENT, () => setVisible(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return visible;
}
