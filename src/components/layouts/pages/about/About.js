import React, { useMemo } from 'react';
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
    const { fileService, jobService } = props;
    const fileServiceInfo = useMemo(() => buildServiceInfo(fileService), [fileService]);
    const jobServiceInfo = useMemo(() => buildServiceInfo(jobService), [jobService]);

    return (
        <section className="about">
            <h3>Services</h3>
            <ul className="service-list">
                <li className="service-info file">
                    File storage:
                    <span className={classNames('service-info__status', { _error: fileService.available === false })}>
                        {fileServiceInfo}
                    </span>
                </li>
                <li className="service-info job">
                    Job service:
                    <span className={classNames('service-info__status', { _error: jobService.available === false })}>
                        {jobServiceInfo}
                    </span>
                </li>
            </ul>
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
    jobService: ServiceStatusShape.isRequired,
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
        jobService: state.serverInfo.jobService,
    };
}

export default connect(mapStateToProps)(About);
