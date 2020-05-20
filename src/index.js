import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import configureStore from './store/rootStore';
import * as serviceWorker from './serviceWorker';
import App from './components/App';
import './index.scss';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#cf3f4f',
            dark: '#ca192d', // hover color
        },
        secondary: {
            main: '#4caf50',
        },
    },
});

ReactDOM.render(
    <Provider store={configureStore()}>
        <ThemeProvider theme={theme}>
            <Router basename="/demo">
                <App />
            </Router>
        </ThemeProvider>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
