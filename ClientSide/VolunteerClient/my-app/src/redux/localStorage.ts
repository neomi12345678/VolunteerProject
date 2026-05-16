export const loadState = () => {
    try {
      const serializedState = localStorage.getItem('volunteerState');
      return serializedState ? JSON.parse(serializedState) : undefined;
    } catch {
      return undefined;
    }
  };
  
  export const saveState = (state: any) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem('volunteerState', serializedState);
    } catch {}
  };