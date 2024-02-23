import React, { useCallback, useState } from 'react';
import {
    Box,
    Radio,
    Button,
    TextField,
    Typography,
    RadioGroup,
    FormLabel,
    FormControl,
    FormControlLabel,
} from '@material-ui/core';

import './Feedback.scss';

const FormItemName = {
    SERVICE_QUALITY: 'serviceQuality',
    COMMENT: 'comment',
    REQUEST_ANALYSIS: 'requestAnalysis',
    USERNAME: 'username',
    EMAIL: 'email',
};

function Feedback() {
    const [isAnalysisVisible, setIsAnalysisVisible] = useState(false);
    const [isCommentlVisible, setIsCommentlVisible] = useState(false);
    const handleValidationStatusChange = useCallback((e, value) => {
        if (value === 'yes') {
            setIsCommentlVisible(false);
            setIsAnalysisVisible(false);
        } else setIsCommentlVisible(true);
    }, []);
    const handleRequestAnalysisChange = useCallback((e, value) => {
        if (value === 'no') setIsAnalysisVisible(false);
        else setIsAnalysisVisible(true);
    }, []);
    const handleSubmit = useCallback(e => {
        e.preventDefault();
        const { target } = e;
        if (target) {
            const data = {
                [FormItemName.SERVICE_QUALITY]: target.elements[FormItemName.SERVICE_QUALITY].value,
                [FormItemName.COMMENT]: target.elements[FormItemName.COMMENT]?.value ?? '',
                userData:
                    target.elements[FormItemName.REQUEST_ANALYSIS]?.value !== 'yes'
                        ? null
                        : {
                              [FormItemName.EMAIL]: target.elements[FormItemName.EMAIL].value,
                              [FormItemName.USERNAME]: target.elements[FormItemName.USERNAME].value,
                          },
            };
            console.log('Form data:', data);
        }
    }, []);
    return (
        <section className="feedback">
            <Typography className="form-header">Feedback</Typography>
            <form onSubmit={handleSubmit}>
                <FormControl>
                    <Box className="form-block">
                        <FormLabel>Have we validated your PDF correctly?</FormLabel>
                        <RadioGroup row name={FormItemName.SERVICE_QUALITY} onChange={handleValidationStatusChange}>
                            <FormControlLabel value="yes" control={<Radio required />} label="Yes" />
                            <FormControlLabel value="no" control={<Radio required />} label="No" />
                            <FormControlLabel value="partially" control={<Radio required />} label="Partially" />
                        </RadioGroup>
                    </Box>
                    {isCommentlVisible && (
                        <Box className="form-block">
                            <Box className="form-block">
                                <FormLabel>Please provide any additional information if you like</FormLabel>
                                <TextField
                                    multiline
                                    maxRows={8}
                                    minRows={8}
                                    name={FormItemName.COMMENT}
                                    variant="outlined"
                                    placeholder="Additional information..."
                                />
                            </Box>
                            <Box className="form-block">
                                <FormLabel>Would you like us to analyze the issues and come back to you?</FormLabel>
                                <RadioGroup
                                    row
                                    name={FormItemName.REQUEST_ANALYSIS}
                                    onChange={handleRequestAnalysisChange}
                                >
                                    <FormControlLabel value="yes" control={<Radio required />} label="Yes" />
                                    <FormControlLabel value="no" control={<Radio required />} label="No" />
                                </RadioGroup>
                            </Box>
                            {isAnalysisVisible && (
                                <Box className="form-block">
                                    <FormLabel>Enter your contact information</FormLabel>
                                    <TextField
                                        required
                                        type="text"
                                        variant="outlined"
                                        placeholder="Your Name"
                                        inputProps={{ 'data-testid': 'login-page-name' }}
                                        name={FormItemName.USERNAME}
                                    />
                                    <TextField
                                        required
                                        type="email"
                                        variant="outlined"
                                        placeholder="E-Mail Address"
                                        inputProps={{ 'data-testid': 'login-page-email' }}
                                        name={FormItemName.EMAIL}
                                    />
                                </Box>
                            )}
                        </Box>
                    )}
                    <Box>
                        <Button className="form-button" variant="contained" type="submit" color="primary">
                            Submit
                        </Button>
                    </Box>
                </FormControl>
            </form>
        </section>
    );
}

export default Feedback;
