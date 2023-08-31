import Checkbox from '@material-ui/core/Checkbox';

import './RoleMap.scss';

const CHECKBOX_HEADER = 'RoleMap';

function RoleMap({ roleMap, setRoleMap }) {
    const handleClick = () => {
        setRoleMap(!roleMap);
    };

    return (
        <div className="roleMap">
            {CHECKBOX_HEADER}
            <Checkbox
                className="roleMap__checkbox"
                color="primary"
                size="small"
                checked={roleMap}
                onChange={handleClick}
                inputProps={{ 'aria-label': 'primary checkbox' }}
            />
        </div>
    );
}

export default RoleMap;
