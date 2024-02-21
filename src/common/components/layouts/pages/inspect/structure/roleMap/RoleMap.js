import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';

const HEADER = 'RoleMap';

function RoleMap({ roleMap, setRoleMap }) {
    const handleClick = () => {
        setRoleMap(prev => !prev);
    };

    return (
        <div className="roleMap">
            {HEADER}
            <Checkbox
                color="primary"
                size="medium"
                checked={roleMap}
                onChange={handleClick}
                inputProps={{ 'aria-label': 'primary checkbox' }}
            />
        </div>
    );
}

export default RoleMap;
