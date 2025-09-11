import { createSlice, type  PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
    text: string;
}

const initialState: ChatState = {
    text: '',
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setText(state, action: PayloadAction<string>) {
            state.text = action.payload;
        },
        clearText(state) {
            state.text = '';
        },
    },
});

export const { setText, clearText } = chatSlice.actions;
export default chatSlice.reducer;