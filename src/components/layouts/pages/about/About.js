import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import './About.scss';

const BUILD_TIME_FORMAT = {
    locale: 'en-US',
    options: {
        dateStyle: 'long',
        timeStyle: 'long',
        timeZone: 'UTC',
    },
};

function About(props) {
    const { fileService } = props;
    const fileServiceInfo = buildServiceInfo(fileService);

    return (
        <section className="about">
            <h3>Services</h3>
            <div className="service-info file">
                File storage:
                <span className={classNames('service-info__status', { _error: fileService.available === false })}>
                    {fileServiceInfo}
                </span>
            </div>
        </section>
    );
}

const ServiceStatusShape = PropTypes.shape({
    available: PropTypes.bool,
    build: PropTypes.shape({
        version: PropTypes.string,
        time: PropTypes.string,
    }),
});

About.propTypes = {
    fileService: ServiceStatusShape.isRequired,
};

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

function mapStateToProps(state) {
    return {
        fileService: state.serverInfo.fileService,
    };
}

export default connect(mapStateToProps)(About);
