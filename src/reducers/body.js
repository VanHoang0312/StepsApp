const bodyReducer = (state = { bodyData: null }, action) => {
  switch (action.type) {
    case 'SET_BODY_DATA':
      return { ...state, bodyData: action.payload };
    default:
      return state;
  }
};

export default bodyReducer