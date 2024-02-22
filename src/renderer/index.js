import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import configureStore from '../common/store/rootStore';
import * as serviceWorker from './serviceWorker';
import App from '../common/components/App';
import './index.scss';

const theme = createTheme({
    palette: {
        primary: {
            main: '#643346',
            dark: '#502837', // hover color
        },
        // For secondary components like Progress
        secondary: {
            main: '#4cad93',
        },
        // For results chart
        success: {
            main: '#4cad93',
        },
        error: {
            main: '#cf3f4f',
        },
        // Apply general app font-color to material components
        text: {
            primary: 'rgba(0, 0, 0, 0.75)',
            secondary: 'rgba(0, 0, 0, 0.75)', // Dialog content font color
        },
    },
});

ReactDOM.render(
    <Provider store={configureStore()}>
        <ThemeProvider theme={theme}>
            <Router basename={process.env.REACT_APP_BASE_NAME || ''}>
                <App />
            </Router>
        </ThemeProvider>
    </Provider>,
    document.getElementById('app')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
