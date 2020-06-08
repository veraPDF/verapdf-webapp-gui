import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Footer.scss';

const BUILD_TIME_FORMAT = {
    locale: 'en-US',
    options: {
        dateStyle: 'long',
        timeStyle: 'long',
        timeZone: 'UTC',
    },
};

function Footer(props) {
    const { appVersion, fileService, jobService } = props;
    const fileServiceInfo = useMemo(() => buildServiceInfo(fileService), [fileService]);
    const jobServiceInfo = useMemo(() => buildServiceInfo(jobService), [jobService]);

    return (
        <footer className="app-footer">
            <div title={`File storage: ${fileServiceInfo}\nJob service: ${jobServiceInfo}`}>version: {appVersion}</div>
        </footer>
    );
}

function buildServiceInfo(service) {
    switch (service.available) {
        case true:
            let buildTime = new Date(service.build.time);
            return `${service.build.version}, built on ${buildTime.toLocaleString(
                BUILD_TIME_FORMAT.locale,
                BUILD_TIME_FORMAT.options
            )}`;

        case false:
            return 'service is not available.';

        default:
            return 'loading service status...';
    }
}

const ServiceStatusShape = PropTypes.shape({
    available: PropTypes.bool,
    build: PropTypes.shape({
        version: PropTypes.string,
        time: PropTypes.string,
    }),
});

Footer.propTypes = {
    appVersion: PropTypes.string.isRequired,
    fileService: ServiceStatusShape.isRequired,
    jobService: ServiceStatusShape.isRequired,
};

function mapStateToProps(state) {
    return {
        appVersion: state.serverInfo.version,
        fileService: state.serverInfo.fileService,
        jobService: state.serverInfo.jobService,
    };
}

export default connect(mapStateToProps)(Footer);
